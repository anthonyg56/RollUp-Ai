import { useAppForm } from "@/components/hooks/useFormApp";
import { useDialogStore } from "@/components/hooks/useStores";
import { api } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "../ui/button";

const newVideoFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  generateCaptions: z.boolean(),
  generateBroll: z.boolean(),
});

interface NewVideoFormProps {
  setView: (view: "form" | "dropzone") => void;
}

export default function NewVideoForm({ setView }: NewVideoFormProps) {
  const navigate = useNavigate();
  const uploadNewVideoOptions = useDialogStore(state => state.uploadNewVideoOptions);

  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      generateCaptions: true,
      generateBroll: true,
    },
    validators: {
      onSubmit: newVideoFormSchema,
    },
    onSubmit: async ({ value }) => await postNewVideo(value),
  });

  const { mutateAsync: postNewVideo, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof newVideoFormSchema>) => {
      if (!uploadNewVideoOptions?.file) {
        throw new Error("Video file is not set");
      }

      const postNewVideoResponse = await api
        .videos
        .$post({
          json: {
            submissionData: {
              title: data.title,
              description: data.description,
              autoGenerateCaptions: data.generateCaptions,
              autoGenerateBroll: data.generateBroll,
            },
            videoFile: uploadNewVideoOptions.file,
          }
        })

      const postNewVideoJson = await postNewVideoResponse.json();

      return postNewVideoJson.data;
    },
    onSuccess: (data) => {
      const { videoSubmissionId } = data;

      navigate({
        to: "/videos/$id/process",
        params: {
          id: videoSubmissionId,
        },
      });
    },
    onError: (error) => {
      console.error(error);
    }
  });

  function fileNameToTitle(fileName: string) {
    let filename = fileName.split(".")[0];

    if (filename.length > 20) {
      filename = filename.slice(0, 20) + "...";
    }

    filename = filename.replace(/_/g, " ");
    filename = filename.replace(/-/g, " ");

    return filename;
  }

  if (!uploadNewVideoOptions?.file) {
    setView("dropzone");
    return;
  };

  const fileName = fileNameToTitle(uploadNewVideoOptions.file.name);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
      aria-disabled={isPending}
    >
      <form.AppField
        name="title"
        children={field => {
          return (
            <field.TextField
              name="title"
              id="title"
              label="Title"
              defaultValue={fileName}
              placeholder={`Enter a title for your video ${fileName}`}
            />
          )
        }}
      />
      <form.AppField
        name="description"
        children={field => {
          return (
            <field.TextField
              name="description"
              id="description"
              label="Description"
              placeholder={`Tell us about your video ${fileName}`}
            />
          )
        }}
      />
      <form.AppField
        name="generateCaptions"
        children={field => {
          return (
            <field.ToggleField
              checked
              name="generateCaptions"
              id="generateCaptions"
              label="Generate Captions"
              description="Automatically generate captions for your video"
            />
          )
        }}
      />
      <form.AppField
        name="generateBroll"
        children={field => {
          return (
            <field.ToggleField
              checked
              name="generateBroll"
              id="generateBroll"
              label="Generate Broll"
              description="Automatically generate B-roll content at diffferent intervals of your video"
            />
          )
        }}
      />

      <form.AppForm>
        <div className="flex flex-col gap-3">
          <form.SubmitButton
            label="Create Video"
            submittingLabel="Creating video..."
            disabled={isPending}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setView("dropzone");
            }}
            className="w-full"
          >
            Back
          </Button>
        </div>

      </form.AppForm>
    </form>
  )
}


