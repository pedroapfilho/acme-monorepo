import { createFormHookContexts } from "@tanstack/react-form";
import { createContext } from "react";

const PendingContext = createContext(false);
const RequiredFieldsContext = createContext<ReadonlyArray<string>>([]);

const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export { fieldContext, formContext, PendingContext, RequiredFieldsContext, useFieldContext };
