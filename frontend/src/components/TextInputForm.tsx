import { Button, Stack, TextField } from "@mui/material";
import { useState } from "react";

interface TextInputFormProps {
  onClick: (text: string) => void;
  buttonText: string;
  label: string;
}

export const TextInputForm = ({
  onClick,
  buttonText,
  label,
}: TextInputFormProps) => {
  const [text, setText] = useState("");

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  const handleSubmit = () => {
    onClick(text);
    setText("");
  };

  return (
    <Stack direction="row" spacing={2} justifyContent="center">
      <TextField
        variant="outlined"
        value={text}
        onChange={handleTextChange}
        label={label}
      />
      <Button variant="outlined" onClick={handleSubmit} disabled={!text}>
        {buttonText}
      </Button>
    </Stack>
  );
};
