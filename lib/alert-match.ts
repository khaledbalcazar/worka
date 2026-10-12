// ¿Una vacante de Worka coincide con una alerta de empleo? Misma regla que
// usa el cron diario de alertas, separada para poder usarla al publicar
// (alertas al instante de Worka Pro) y para probarla.

export type AlertRule = {
  keyword: string | null;
  industry: string | null;
  city: string | null;
  country: string;
  modality: string | null;
};

export type AlertJob = {
  title: string;
  industry: string | null;
  modality: string | null;
  address: string | null;
  companyCountry: string | null;
  companyCity: string | null;
};

export function normAlert(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function alertMatchesJob(a: AlertRule, j: AlertJob): boolean {
  if (normAlert(j.companyCountry || "py") !== normAlert(a.country)) return false;
  if (a.industry && normAlert(j.industry) !== normAlert(a.industry)) return false;
  if (a.modality && normAlert(j.modality) !== normAlert(a.modality)) return false;
  if (a.keyword && !normAlert(j.title).includes(normAlert(a.keyword))) return false;
  if (a.city) {
    const city = normAlert(a.city);
    if (!normAlert(j.address).includes(city) && !normAlert(j.companyCity).includes(city)) return false;
  }
  return true;
}
