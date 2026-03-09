import { ErrorMessage, type FieldProps, FastField } from "formik";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface FormikTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const FormikTextarea = ({
  name,
  label,
  placeholder,
  className,
  required,
}: FormikTextareaProps) => {
  return (
    <div className="grid w-full items-start gap-1.5">
      <Label htmlFor={name} className="text-foreground mb-1 gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <FastField name={name}>
        {({ field }: FieldProps) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            className={cn("text-foreground", className)}
          />
        )}
      </FastField>

      <ErrorMessage
        name={name}
        component="p"
        className="text-sm text-rose-500"
      />
    </div>
  );
};

export default memo(FormikTextarea);
