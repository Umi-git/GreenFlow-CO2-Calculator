import { z } from "zod";

const safeDatePreprocess = (val: any) => {
  if (!val) return new Date();
  const parsedDate = new Date(val);
  return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
};

/**
 * 1. Haupt-Schema (Sucht fehlertolerant nach C# Feldern und bereinigt sie für React)
 */
export const carbonReportSchema = z
  .preprocess(
    (raw: any) => {
      if (!raw || typeof raw !== "object") return raw;

      // Kleinschreibungs-Brücke gegen C# Groß-/Kleinschreibungs-Konflikte
      const lowerRaw: Record<string, any> = {};
      for (const key in raw) {
        lowerRaw[key.toLowerCase()] = raw[key];
      }

      // Jedes Feld wird hier explizit mit Fallbacks belegt, falls das Backend es auslässt
      return {
        id: lowerRaw["id"] || undefined,
        companyName: lowerRaw["companyname"] || "Unbekanntes Unternehmen",
        startDate: safeDatePreprocess(lowerRaw["startdate"]),
        endDate: safeDatePreprocess(lowerRaw["enddate"]),
        dieselLiters:
          lowerRaw["dieselliters"] !== undefined &&
          lowerRaw["dieselliters"] !== null
            ? Number(lowerRaw["dieselliters"])
            : 0,
        naturalGasKWh:
          lowerRaw["naturalgaskwh"] !== undefined &&
          lowerRaw["naturalgaskwh"] !== null
            ? Number(lowerRaw["naturalgaskwh"])
            : 0,
        electricityKWh:
          lowerRaw["electricitykwh"] !== undefined &&
          lowerRaw["electricitykwh"] !== null
            ? Number(lowerRaw["electricitykwh"])
            : 0,
        co2Scope1: lowerRaw["co2scope1"] || 0,
        co2Scope2: lowerRaw["co2scope2"] || 0,
        totalCo2: lowerRaw["totalco2"] || 0,
        createdAt: safeDatePreprocess(lowerRaw["createdat"]),
        createdBy: lowerRaw["createdby"] || "System",
      };
    },
    z.object({
      id: z.string().uuid().optional(),
      companyName: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      dieselLiters: z.number(),
      naturalGasKWh: z.number(),
      electricityKWh: z.number(),
      co2Scope1: z.number().optional().nullable(),
      co2Scope2: z.number().optional().nullable(),
      totalCo2: z.number().optional().nullable(),
      createdAt: z.date().optional(),
      createdBy: z.string().optional().nullable(),
    }),
  )
  .refine((data) => data.endDate >= data.startDate, {
    message: "Enddatum muss nach dem Startdatum liegen.",
    path: ["endDate"],
  });

export type CarbonReport = z.infer<typeof carbonReportSchema>;

/**
 * 2. Das Formular-Schema (Für React-Inputs beim Erstellen)
 */
export const CreateCarbonReportInputSchema = z
  .object({
    companyName: z
      .string()
      .min(3, "Firmenname muss mindestens 3 Zeichen lang sein."),
    startDate: z.date({ message: "Startdatum erforderlich." }),
    endDate: z.date({ message: "Enddatum erforderlich." }),
    dieselLiters: z.number().min(0, "Wert muss positiv sein."),
    naturalGasKWh: z.number().min(0, "Wert muss positiv sein."),
    electricityKWh: z.number().min(0, "Wert muss positiv sein."),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "Enddatum muss nach dem Startdatum liegen.",
    path: ["endDate"],
  });

export type CreateCarbonReportInput = z.infer<
  typeof CreateCarbonReportInputSchema
>;
