import { useAppForm } from "@/components/hooks/useFormApp";
import { surveyIndustriesAnswers, SurveyIndustry, SurveyReferralSource, surveyReferralSourcesAnswers } from "@/lib/constants";
import { z } from "zod";
import { surveyIndustrySchema } from "@/lib/schemas/base";
import { surveyReferralSourceSchema } from "@/lib/schemas/base";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@tanstack/react-form";
import { useNavigate, useRouteContext } from "@tanstack/react-router";

const onboardingSurveySchema = z.object({
  referralSource: surveyReferralSourceSchema,
  otherSource: z.string(),
  industry: surveyIndustrySchema,
  otherIndustry: z.string(),
  usedSimilar: z.boolean(),
  platformName: z.string(),
  signupReason: z.string(),
});


export default function OnboardingSurveryForm() {
  const navigate = useNavigate();
  const { queryClient } = useRouteContext({ from: "__root__" });

  const form = useAppForm({
    defaultValues: {
      referralSource: "search_engine" as SurveyReferralSource,
      otherSource: "",
      industry: "education" as SurveyIndustry,
      otherIndustry: "",
      usedSimilar: false,
      platformName: "",
      signupReason: "",
    },
    validators: {
      onSubmit: onboardingSurveySchema,
    },
    onSubmit: async ({ value }) => await submitSurvey(value),
  });

  const {
    mutateAsync: submitSurvey,
    isPending: isSubmittingSurvey,
    isSuccess: isSubmittingSurveySuccess,
  } = useMutation({
    mutationFn: async (surveyData: z.infer<typeof onboardingSurveySchema>) => {
      const response = await api.onboarding.survey.$post({
        json: surveyData
      });

      const responseData = await response.json();
      const { success } = responseData.data;

      if (!success) {
        throw new Error("Failed to submit onboarding survey");
      }

      return success;
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Onboarding survey submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["getSession"] });
      navigate({ to: "/videos", from: "/survey" });
    }
  });

  const {
    mutateAsync: skipSurvey,
    isPending: isSkippingSurvey,
    isSuccess: isSkippingSurveySuccess,
  } = useMutation({
    mutationFn: async () => {
      const response = await api.onboarding.survey.$put();
      const responseData = await response.json();

      const { message } = responseData;

      if (message !== "Onboarding survey skipped successfully") {
        throw new Error("Failed to skip onboarding survey");
      };

      return message;
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Onboarding survey skipped successfully");
      queryClient.invalidateQueries({ queryKey: ["getSession"] });
      navigate({ to: "/videos", from: "/survey" });
    }
  });

  const formValues = useStore(form.store, state => state.values);

  const showUsedSimilar = formValues.usedSimilar === true;
  const showOtherIndustry = formValues.industry === "other";
  const showOtherSource = formValues.referralSource === "other";

  const disableForm = isSubmittingSurvey || isSkippingSurvey || isSubmittingSurveySuccess || isSkippingSurveySuccess;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      aria-disabled={disableForm}
      className="flex flex-col gap-6 w-full"
    >
      <form.AppField
        name="referralSource"
        children={field => (
          <field.SelectField
            label="Referral Source"
            items={surveyReferralSourcesAnswers}
            disabled={disableForm}
            className="w-full"
          />
        )}
      />
      {showOtherSource && <form.AppField
        name="otherSource"
        children={field => (
          <field.TextField
            label="Other Source"
            disabled={disableForm}
            className="w-full"
          />
        )}
      />}
      <form.AppField
        name="industry"
        children={field => (
          <field.SelectField
            label="Industry"
            items={surveyIndustriesAnswers}
            disabled={disableForm}
            className="w-full"
          />
        )}
      />
      {showOtherIndustry && (
        <form.AppField
          name="otherIndustry"
          children={field => (
            <field.TextField
              label="Other Industry"
              disabled={disableForm}
            />
          )}
        />
      )}
      <form.AppField
        name="usedSimilar"
        children={field => (
          <field.SelectField
            label="Used Similar Platforms"
            items={[
              { label: "Yes", value: true },
              { label: "No", value: false },
            ]}
            disabled={disableForm}
          />
        )}
      />
      {showUsedSimilar && <form.AppField
        name="platformName"
        children={field => (
          <field.TextField
            label="Platform Name"
            disabled={disableForm}
          />
        )}
      />}
      <form.AppField
        name="signupReason"
        children={field => (
          <field.TextAreaField
            label="Signup Reason"
            disabled={disableForm}
          />
        )}
      />
      <div className="flex flex-col gap-2">
        <form.AppForm>
          <form.SubmitButton label="Submit" />
        </form.AppForm>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={disableForm}
          onClick={() => skipSurvey()}
        >
          Skip
        </Button>
      </div>
    </form>
  )
}
