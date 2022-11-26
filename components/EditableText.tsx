import { CheckIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import {
  useEditableControls,
  EditableInput,
  ButtonGroup,
  Flex,
  IconButton,
  Input,
  Editable,
  EditableTextarea,
  EditablePreview,
} from "@chakra-ui/react";
import { ChangeEventHandler, useState } from "react";

function EditableControls() {
  const { isEditing, getSubmitButtonProps, getCancelButtonProps, getEditButtonProps } = useEditableControls();

  return isEditing ? (
    <ButtonGroup justifyContent="center" size="xs">
      <IconButton aria-label="" size="xs" icon={<CheckIcon />} {...getSubmitButtonProps()} />
      <IconButton aria-label="" size="xs" icon={<CloseIcon />} {...getCancelButtonProps()} />
    </ButtonGroup>
  ) : (
    <Flex justifyContent="center">
      <IconButton aria-label="" size="xs" icon={<EditIcon />} {...getEditButtonProps()} />
    </Flex>
  );
}

interface EditableTextProps {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined;
}

export default function EditableText(props: EditableTextProps) {
  const { value, defaultValue, onChange } = props;

  return (
    <Editable
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      defaultValue={defaultValue}
      fontSize="sm"
      gap="5px"
      value={value}
      isPreviewFocusable={false}
    >
      <EditablePreview />
      <Input size="xs" as={EditableInput} onChange={onChange} />
      <EditableControls />
    </Editable>
  );
}
