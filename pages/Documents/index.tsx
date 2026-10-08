import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { boutiqueService, creatriceService, statsService } from "@/services/api";
import { downloadAndShare } from "@/services/download";
import { buildExportRequest } from "@/services/exportRequest";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import Card from "@/components/Cards/Card";
import Badge from "@/components/Badge/Badge";
import Chip from "@/components/Chip/Chip";
import { Notice } from "@/components/Notice/Notice";
import PeriodePicker, { formatPeriode } from "@/components/PeriodePicker";

// Un seul écran pour tous les exports (avant : répartis entre Stats et les fiches
// boutique / créatrice). Mêmes routes serveur, mêmes règles de plan que sur le web —
// le serveur reste l'autorité :
//   FREE   : PDF seulement, mois en cours uniquement
//   PRO/DUO: PDF + Excel + CSV, n'importe quel mois ou tout l'historique

type Doc = "ventes" | "recap";
type Format = "pdf" | "excel" | "csv";

const FORMATS: { type: Format; ext: string; label: string; proOnly: boolean }[] = [
  { type: "pdf", ext: "pdf", label: "PDF", proOnly: false },
  { type: "excel", ext: "xlsx", label: "Excel", proOnly: true },
  { type: "csv", ext: "csv", label: "CSV", proOnly: true },
];

const round2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

function moisCourant() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function Step({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <View style={s.step}>
      <View style={s.num}><Text style={s.numTxt}>{num}</Text></View>
      <View style={s.stepBody}>
        <Text style={s.stepTitle}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

function Option({ active, title, sub, onPress }: { active: boolean; title: string; sub: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[s.option, active && s.optionOn]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={s.optionTitle}>{title}</Text>
      <Text style={s.optionSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

export default function DocumentsScreen() {
  const router = useRouter();
  const { creatriceId: creatricePreset } = useLocalSearchParams<{ creatriceId?: string }>();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const duoMode = useAuthStore((s) => s.duoMode);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const gerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");
  const pro = user?.plan === "PRO" || user?.plan === "DUO";
  const currentMode: "GERANTE" | "CREATRICE" = gerante ? "GERANTE" : "CREATRICE";

  const [doc, setDoc] = useState<Doc>("ventes");
  const [pour, setPour] = useState<"boutique" | "creatrice">(gerante && creatricePreset ? "creatrice" : "boutique");
  const [creatriceId, setCreatriceId] = useState(gerante ? (creatricePreset ?? "") : "");
  const [boutiqueId, setBoutiqueId] = useState("");
  const [mois, setMois] = useState<string | null>(pro ? null : moisCourant());
  const [downloading, setDownloading] = useState<Format | null>(null);

  const { data: boutiques = [] } = useQuery<any[]>({
    queryKey: ["mes-boutiques-documents"],
    queryFn: boutiqueService.getMesBoutiques,
    enabled: gerante,
  });
  const { data: creatrices = [] } = useQuery<any[]>({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: gerante,
  });

  // FREE : toujours le mois en cours (le serveur l'impose aussi)
  const moisEffectif = pro ? mois : moisCourant();
  const parCreatrice = gerante && doc === "ventes" && pour === "creatrice";
  const creatriceChoisie = creatrices.find((c) => c.id === creatriceId);
  // Le récapitulatif porte sur UNE boutique (celle choisie, sinon la 1re côté serveur)
  const boutiqueEffective = boutiqueId || (doc === "recap" && boutiques.length > 1 ? boutiques[0]?.id : "") || "";

  // Aperçu : nombre de ventes et CA de la période (hors choix « une créatrice », sans route dédiée)
  const { data: apercu } = useQuery({
    queryKey: ["documents-apercu", currentMode, moisEffectif ?? "tout", boutiqueEffective],
    queryFn: () =>
      statsService.getGlobal({
        mode: currentMode,
        ...(moisEffectif ? { mois: moisEffectif } : {}),
        ...(gerante && boutiqueEffective ? { boutiqueId: boutiqueEffective } : {}),
      }),
    enabled: !parCreatrice,
  });
  const nbVentes: number = apercu?.stats?._count ?? 0;
  const ca: number = apercu?.stats?._sum?.prixVente ?? 0;

  function buildRequest(format: Format) {
    return buildExportRequest({
      format,
      gerante,
      doc,
      mois: moisEffectif,
      boutiqueId: boutiqueId || undefined,
      boutiqueRecap: boutiqueEffective || undefined,
      creatriceId: parCreatrice && creatriceId ? creatriceId : undefined,
      creatriceNom: creatriceChoisie?.nom,
    });
  }

  async function handleDownload(format: Format) {
    const { path, filename } = buildRequest(format);
    setDownloading(format);
    await downloadAndShare(path, filename, token);
    setDownloading(null);
  }

  const showDocStep = gerante;
  const showPourStep = gerante && doc === "ventes";
  const showBoutiqueStep = gerante && boutiques.length > 1;
  let compteur = 0;
  const numDoc = showDocStep ? ++compteur : 0;
  const numPeriode = ++compteur;
  const numPour = showPourStep ? ++compteur : 0;
  const numBoutique = showBoutiqueStep ? ++compteur : 0;
  const numFormat = ++compteur;
  const canDownload = !parCreatrice || !!creatriceId;
  const periodeLabel = moisEffectif ? formatPeriode(moisEffectif) : "tous les mois";

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Retour" style={s.back}>
        <Text style={s.backTxt}>‹ Retour</Text>
      </TouchableOpacity>
      <Text style={s.titre}>Documents</Text>
      <Text style={s.sub}>Tous tes exports au même endroit</Text>

      <Card style={{ gap: 20, marginTop: 14 }}>
        {showDocStep && (
          <Step num={numDoc} title="Quel document ?">
            <Option active={doc === "ventes"} title="Détail des ventes" sub="Une ligne par vente, avec commission et net" onPress={() => setDoc("ventes")} />
            <Option active={doc === "recap"} title="Récapitulatif" sub="Une ligne par créatrice, avec totaux" onPress={() => setDoc("recap")} />
          </Step>
        )}

        <Step num={numPeriode} title="Quelle période ?">
          {pro ? (
            <PeriodePicker value={mois} onChange={setMois} />
          ) : (
            <View style={{ gap: 6, alignItems: "flex-start" }}>
              <Badge color="primary">{formatPeriode(moisCourant()).replace(/^./, (c) => c.toUpperCase())}</Badge>
              <Text style={s.hint}>🔒 Plan FREE : mois en cours uniquement. Les autres mois sont réservés à PRO / DUO.</Text>
            </View>
          )}
        </Step>

        {showPourStep && (
          <Step num={numPour} title="Pour qui ?">
            <Option active={pour === "boutique"} title="Toute la boutique" sub="Les ventes de toutes tes créatrices" onPress={() => setPour("boutique")} />
            <Option active={pour === "creatrice"} title="Une créatrice" sub={creatriceChoisie ? creatriceChoisie.nom : "Choisis-la ci-dessous"} onPress={() => setPour("creatrice")} />
            {pour === "creatrice" && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
                {creatrices.map((c) => (
                  <Chip key={c.id} active={creatriceId === c.id} onPress={() => setCreatriceId(c.id)}>{c.nom}</Chip>
                ))}
              </ScrollView>
            )}
          </Step>
        )}

        {showBoutiqueStep && (
          <Step num={numBoutique} title="Quelle boutique ?">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
              {doc === "ventes" && <Chip active={boutiqueId === ""} onPress={() => setBoutiqueId("")}>Toutes</Chip>}
              {boutiques.map((b) => (
                <Chip key={b.id} active={(doc === "recap" ? boutiqueEffective : boutiqueId) === b.id} onPress={() => setBoutiqueId(b.id)}>{b.nom}</Chip>
              ))}
            </ScrollView>
          </Step>
        )}

        <Step num={numFormat} title="Quel format ?">
          <View style={s.formats}>
            {FORMATS.map((format) => {
              const locked = format.proOnly && !pro;
              const loading = downloading === format.type;
              const disabled = locked || !!downloading || !canDownload;
              return (
                <TouchableOpacity
                  key={format.type}
                  style={[s.format, locked && s.formatLocked, !locked && disabled && { opacity: 0.55 }]}
                  onPress={() => !locked && handleDownload(format.type)}
                  disabled={disabled}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={locked ? `${format.label} (réservé aux plans PRO et DUO)` : `Télécharger en ${format.label}`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Text style={[s.formatTxt, locked && { color: Colors.textLight }]}>{format.label}</Text>
                      {locked ? <Badge color="primary">PRO</Badge> : <Text style={s.formatTxt}>↓</Text>}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {!canDownload && <Text style={s.hint}>Choisis d'abord une créatrice.</Text>}
          {canDownload && !parCreatrice && (
            <Text style={s.hint}>Aperçu : {nbVentes} vente{nbVentes > 1 ? "s" : ""} · {round2(ca)} € · {periodeLabel}</Text>
          )}
          {!pro && <Text style={s.hint}>Excel et CSV : plans PRO / DUO.</Text>}
        </Step>
      </Card>

      {gerante && boutiques.length === 0 && <Notice>Crée d'abord une boutique pour pouvoir exporter des ventes.</Notice>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 40, gap: 4 },
  back: { alignSelf: "flex-start", paddingVertical: 6, marginBottom: 4 },
  backTxt: { fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.sm, color: Colors.primary },
  titre: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: 30, color: Colors.text, letterSpacing: -0.5 },
  sub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 2 },
  step: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  num: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginTop: 1 },
  numTxt: { fontFamily: Fonts.family.nowBold, fontSize: 12, color: "#fff" },
  stepBody: { flex: 1, gap: 8 },
  stepTitle: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.md, color: Colors.text, marginTop: 2 },
  option: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: Colors.surface },
  optionOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryFaint },
  optionTitle: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.sm, color: Colors.text },
  optionSub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
  chips: { gap: 8, paddingVertical: 2 },
  hint: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.xs, color: Colors.textLight },
  formats: { gap: 8 },
  format: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: Colors.primary, borderRadius: Radius.md, minHeight: 46, paddingHorizontal: 16 },
  formatLocked: { backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border },
  formatTxt: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.sm, color: "#fff" },
});
