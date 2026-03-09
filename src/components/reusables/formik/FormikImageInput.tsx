import { Input } from '@/components/ui/input';
import { useField, useFormikContext } from 'formik';
import React, { memo, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface FormikImageInputProps {
  name: string;
  label: string;
  className?: string;
  accept?: string;
  previewUrl?: string;
  required?: boolean;
}

const FormikImageInput = ({
  name,
  label,
  className,
  accept = 'image/*',
  previewUrl,
  required,
}: FormikImageInputProps) => {
  const [field, meta] = useField<File | null>(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Mark as touched
    setFieldTouched(name, true, false); // false: don't validate immediately

    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'heic' || fileExtension === 'heif') {
        toast.error('HEIC/HEIF images are not supported. Please upload JPEG or PNG.');
        setFieldValue(name, null);
        setPreview(null);
        // Clear the actual file input
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        return;
      }

      setFieldValue(name, file); // Update Formik field
      setPreview(URL.createObjectURL(file));
    } else {
      setFieldValue(name, null);
      setPreview(null);
    }
  };

  // Cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Reset preview when the field value is reset by Formik
  useEffect(() => {
    if (!field.value) {
      setPreview(null);
    }
  }, [field.value]);

  return (
    <div className="mb-5 grid w-full items-start gap-2">
      <label className="text-foreground">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <Input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className={className}
        ref={inputRef}
      />

      {preview && (
        <img src={preview} alt="Preview" className="mt-2 h-48 w-full rounded object-contain" />
      )}

      {previewUrl && !preview && (
        <img
          src={previewUrl}
          alt="Preview"
          className="mt-2 h-48 w-full rounded object-contain"
          fetchPriority="high"
          loading="lazy"
        />
      )}

      {meta.touched && meta.error && <p className="text-sm text-rose-500">{meta.error}</p>}
    </div>
  );
};

export default memo(FormikImageInput);
