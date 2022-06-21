"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CloudUpload_1 = require("@mui/icons-material/CloudUpload");
const material_1 = require("@mui/material");
const react_1 = require("react");
const user_1 = require("../api/user");
const Input = (0, material_1.styled)("input")({
    display: "none",
});
const UploadAvatar = () => {
    const { mutate } = (0, user_1.usePostAvatar)();
    const [image, setImage] = (0, react_1.useState)();
    const [imgName, setImgName] = (0, react_1.useState)("CHANGE AVATAR");
    const onImageChange = (e) => {
        setImage(e.target.files[0]);
        setImgName(e.target.files[0].name);
    };
    const onImageUpload = () => {
        if (!image)
            return;
        let formData = new FormData();
        formData.append("file", image, image.name);
        mutate(formData);
        setImgName("CHANGE AVATAR");
    };
    return (<material_1.Stack direction="row" alignItems="center" spacing={0}>
      <label htmlFor="contained-button-file">
        <Input accept="image/*" id="contained-button-file" multiple type="file" onChange={onImageChange}/>
        <material_1.Button variant="outlined" component="span">
          {imgName}
        </material_1.Button>
      </label>
      <label htmlFor="icon-button-file">
        <material_1.Button color="primary" aria-label="upload picture" component="span" variant="contained" onClick={() => onImageUpload()}>
          <CloudUpload_1.default />
        </material_1.Button>
      </label>
    </material_1.Stack>);
};
exports.default = UploadAvatar;
//# sourceMappingURL=UploadAvatar.js.map