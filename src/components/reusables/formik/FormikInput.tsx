import { ErrorMessage, type FieldProps, FastField, Field } from "formik";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../../ui/label";
import { Eye, EyeOff } from "lucide-react";
import React, { memo, useState, type ReactNode } from "react";

interface FormikInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string | ReactNode;
  hasEyeIcon?: boolean;
}

const FormikInput = ({
  name,
  label,
  type = "text",
  placeholder,
  className,
  required,
  hasEyeIcon = false,
  disabled = false,
}: FormikInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const inputType = showPassword && isPasswordType ? "text" : type;

  return (
    <div className="tw-input-wrap mb-4 grid w-full items-center">
      <Label htmlFor={name} className="mb-2 text-base">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <div className="relative">
        {hasEyeIcon ? (
          <Field name={name}>
            {({ field }: FieldProps) => (
              <Input
                {...field}
                id={name}
                type={inputType}
                placeholder={placeholder}
                className={cn("text-foreground pr-10", className)} // leave space for the icon
                disabled={disabled}
              />
            )}
          </Field>
        ) : (
          <FastField name={name}>
            {({ field }: FieldProps) => (
              <Input
                {...field}
                id={name}
                type={inputType}
                placeholder={placeholder}
                className={cn("text-foreground pr-10", className)} // leave space for the icon
                disabled={disabled}
              />
            )}
          </FastField>
        )}

        {hasEyeIcon && isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 focus:outline-none"
            tabIndex={-1} // avoid tab focus if not needed
          >
            {showPassword ? (
              <EyeOff size={20} className="cursor-pointer" />
            ) : (
              <Eye size={20} className="cursor-pointer" />
            )}
          </button>
        )}
      </div>

      <ErrorMessage
        name={name}
        component="p"
        className="mt-1 text-sm text-red-500"
      />
    </div>
  );
};

export default memo(FormikInput);
