import { useField, useFormikContext } from "formik";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { memo, type ReactNode } from "react";

interface Option {
  label: string;
  value: string;
}

interface FormikSelectProps {
  name: string;
  label: string | ReactNode;
  options?: Option[];
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  /** External controlled value (optional) */
  value?: Option | null;
  /** Fires when value changes */
  onChange?: (option: Option) => void;
}

const FormikSelect = ({
  name,
  label,
  options,
  placeholder,
  className,
  required,
  disabled,
  value,
  onChange,
}: FormikSelectProps) => {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched, validateForm } =
    useFormikContext<any>();

  const showError = meta.touched && meta.error;

  const handleChange = async (val: string) => {
    const selected = options?.find((opt) => opt.value === val) ?? null;

    await setFieldValue(name, val);
    await setFieldTouched(name, true);
    await validateForm();

    if (onChange && selected) {
      onChange(selected); // ✅ return full option instead of just value
    }
  };

  const selectedValue = value?.value ?? field.value ?? "";

  return (
    <div className="mb-4 grid w-full items-start">
      <Label htmlFor={name} className="text-foreground mb-2 gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Select
        value={selectedValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={name}
          className={cn("text-foreground w-full", className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options?.map((option, index) => (
              <SelectItem key={option.value || index} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {showError && <p className="mt-1 text-sm text-red-500">{meta.error}</p>}
    </div>
  );
};

export default memo(FormikSelect);
