import { get as getStoreValue, writable } from "svelte/store";
import type { AnyZodObject, ZodSchema, z } from "zod";
import omit from "lodash/omit";

function getRootField(key: string) {
  const arrIndex = key.indexOf("[");
  const objIndex = key.indexOf(".");

  let i: number;
  if (arrIndex === -1 && objIndex === -1) return key;
  else if (arrIndex === -1) i = objIndex;
  else if (objIndex === -1) i = arrIndex;
  else i = arrIndex < objIndex ? arrIndex : objIndex;

  return key.substring(0, i);
}

export function createForm<T extends AnyZodObject>(
  schema: T,
  initialValues: {
    [key in keyof z.infer<T>]: any;
  },
  params?: {
    onSubmit?: (values: z.infer<T>) => void;
  }
) {
  const form = writable(initialValues);

  const errors = writable<{ [key in keyof T | string]?: string }>({});

  let submitted = false;

  function validateFromEvent(ev: Event) {
    const target = ev.currentTarget as HTMLInputElement;
    const key = target.name;

    validateFromKey(key);
  }

  function validateFromKey(key: string) {
    const rootKey = getRootField(key);

    const fieldSchema = schema.shape[rootKey] as ZodSchema;

    const value = getStoreValue(form)[rootKey];

    const parseResult = fieldSchema.safeParse(value);

    const currentErrors = getStoreValue(errors);

    const nestedKeys = Object.keys(currentErrors).filter((k) =>
      k.startsWith(rootKey)
    );

    const updates: {
      [key: string]: string;
    } = {};

    if (!parseResult.success) {
      const { issues } = parseResult.error;

      for (const issue of issues) {
        if (issue.path.length > 0) {
          let nestedFieldKey = "";

          for (const entry of issue.path) {
            if (typeof entry === "number") {
              nestedFieldKey += `[${entry}]`;
            } else {
              nestedFieldKey += `.${entry}`;
            }
          }

          updates[rootKey + nestedFieldKey] = issue.message;
        } else {
          if (!updates[rootKey]) updates[rootKey] = issue.message;
        }
      }
    }

    errors.update((s) => ({ ...(omit(s, nestedKeys) as any), ...updates }));
  }

  function validateAll() {
    const values = getStoreValue(form);

    const parseResult = schema.safeParse(values);

    if (parseResult.success) {
      errors.set({});
    } else {
      const { issues } = parseResult.error;

      const updates: {
        [key: string]: string;
      } = {};

      for (const issue of issues) {
        let key = issue.path[0];

        for (const pathEntry of issue.path.slice(1)) {
          if (typeof pathEntry === "number") {
            key += `[${pathEntry}]`;
          } else {
            key += `.${pathEntry}`;
          }
        }

        updates[key] = issue.message;
      }

      errors.set(updates as any);
    }
  }

  function clearValidation(field: string) {
    errors.update((s) => {
      const nestedKeys = Object.keys(s).filter((k) => k.startsWith(field));
      return omit(s, [field, ...nestedKeys]) as any;
    });
  }

  function validate(field: string | Event) {
    if (submitted) {
      if (typeof field === "string") {
        validateFromKey(field);
      } else if (field instanceof Event) {
        validateFromEvent(field);
      }
    }
  }

  function handleSubmit() {
    validateAll();

    submitted = true;

    if (params && params.onSubmit) {
      const currentErrors = getStoreValue(errors);

      if (Object.keys(currentErrors).length === 0) {
        const values = getStoreValue(form);

        params.onSubmit(values as z.infer<T>);
      }
    }
  }

  return { form, errors, validate, handleSubmit, clearValidation };
}
