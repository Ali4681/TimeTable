  import React, { useState } from "react";
  import {
    Select,
    SelectItem,
    SelectTrigger,
    SelectContent,
  } from "@/components/ui/select";

  interface MultiSelectProps {
    options: { value: string; label: string }[];
    value: string[];
    onChange: (selectedValues: string[]) => void;
    placeholder: string;
  }

  const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value,
    onChange,
    placeholder,
  }) => {
    const [open, setOpen] = useState(false);

    const handleValueChange = (selectedValue: string) => {
      if (value.includes(selectedValue)) {
        onChange(value.filter((val) => val !== selectedValue));
      } else {
        onChange([...value, selectedValue]);
      }
    };

    return (
      <Select
        value={undefined}
        onValueChange={() => {}}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger className="w-full border rounded-md p-2">
          <span>{placeholder}</span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              onClick={() => handleValueChange(option.value)}
              className={
                value.includes(option.value) ? "bg-blue-500 text-white" : ""
              }
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  export default MultiSelect;
