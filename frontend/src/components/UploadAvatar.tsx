import CloudUpload from "@mui/icons-material/CloudUpload";
import { Button, Stack, styled } from "@mui/material";
import { useState } from "react";
import { usePostAvatar } from "../api/user";

const Input = styled("input")({
  display: "none",
});

const UploadAvatar = () => {
  const { mutate } = usePostAvatar();
  const [image, setImage] = useState<File>();
  const [imgName, setImgName] = useState("CHANGE AVATAR");

  const onImageChange = (e: any) => {
    setImage(e.target.files[0]);
    setImgName(e.target.files[0].name);
  };

  const onImageUpload = () => {
    if (!image) return;
    let formData = new FormData();
    formData.append("file", image, image.name);
    mutate(formData);
    setImgName("CHANGE AVATAR");
  };

  return (
    <Stack direction="row" alignItems="center" spacing={0}>
      <label htmlFor="contained-button-file">
        <Input
          accept="image/*"
          id="contained-button-file"
          multiple
          type="file"
          onChange={onImageChange}
        />
        <Button variant="outlined" component="span">
          {imgName}
        </Button>
      </label>
      <label htmlFor="icon-button-file">
        <Button
          color="primary"
          aria-label="upload picture"
          component="span"
          variant="contained"
          onClick={() => onImageUpload()}
        >
          <CloudUpload />
        </Button>
      </label>
    </Stack>
  );
};

export default UploadAvatar;
