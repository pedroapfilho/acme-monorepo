"use client";

import { type ReactNode, use } from "react";

import { FieldGroup } from "../components/field";
import { PendingContext, RequiredFieldsContext } from "../lib/form-context";

import { BusyButton, type BusyButtonProps } from "./busy-button";
import { ClientReadyForm } from "./client-ready-form";
import { FormAlert } from "./form-alert";

type FormSubmission = {
  errorMessage: string | null;
  formId: string;
  isPending: boolean;
  requiredFields: ReadonlyArray<string>;
  submit: () => Promise<void>;
};

const AppForm = ({ children, submission }: { children: ReactNode; submission: FormSubmission }) => (
  <ClientReadyForm
    id={submission.formId}
    noValidate
    onSubmit={(event) => {
      event.preventDefault();
      event.stopPropagation();
      void submission.submit();
    }}
  >
    <FormAlert message={submission.errorMessage} />
    <PendingContext value={submission.isPending}>
      <RequiredFieldsContext value={submission.requiredFields}>
        <FieldGroup>{children}</FieldGroup>
      </RequiredFieldsContext>
    </PendingContext>
  </ClientReadyForm>
);

const SubmitButton = (props: Omit<BusyButtonProps, "isPending" | "type">) => {
  const isPending = use(PendingContext);

  return <BusyButton {...props} isPending={isPending} type="submit" />;
};

export { AppForm, SubmitButton };
