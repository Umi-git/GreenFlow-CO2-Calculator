import { useForm, type SubmitHandler } from "react-hook-form";
import {
  CreateCarbonReportInputSchema,
  type CreateCarbonReportInput,
} from "../schemas/schema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function CarbonReportForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCarbonReportInput>({
    resolver: zodResolver(CreateCarbonReportInputSchema),
    defaultValues: {
      companyName: "",
      startDate: undefined,
      endDate: undefined,
      dieselLiters: 0,
      naturalGasKWh: 0,
      electricityKWh: 0,
      createdBy: "Admin", // Here you can set the current user's ID dynamically
    },
  });

  const onSubmit: SubmitHandler<CreateCarbonReportInput> = async (
    data: CreateCarbonReportInput,
  ) => {
    console.log("Form Data:", data);
    // Here you would typically send the data to your backend API
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="companyName">Company Name</label>
      <input
        id="companyName"
        type="text"
        placeholder="Enter company name"
        {...register("companyName")}
      />

      {errors.companyName && (
        <span className="error">{errors.companyName.message}</span>
      )}

      <label htmlFor="startDate">Start Date</label>
      <input id="startDate" type="date" {...register("startDate")} />
      {errors.startDate && (
        <span className="error">{errors.startDate.message}</span>
      )}

      <label htmlFor="endDate">End Date</label>
      <input id="endDate" type="date" {...register("endDate")} />
      {errors.endDate && (
        <span className="error">{errors.endDate.message}</span>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
