import React, { memo, useState, useEffect } from "react";

import { FilePondFile } from "filepond";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css";
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import "filepond/dist/filepond.min.css";
import { FilePond, FilePondProps, registerPlugin } from "react-filepond";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateType
);

interface FileUploadProps extends Omit<FilePondProps, "onupdatefiles"> {
  onChange?: (file: FilePondFile[] | null) => void;
  initialFiles?: NonNullable<FilePondProps["files"]>;
  onupdatefiles?: (file: FilePondFile[] | null) => void;
}

const FileUploadComponent = ({
  onChange,
  initialFiles,
  onupdatefiles,
  ...filePondProps
}: FileUploadProps) => {
  const [files, setFiles] = useState<NonNullable<FilePondProps["files"]>>(
    initialFiles ?? []
  );

  useEffect(() => {
    if (initialFiles !== undefined) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);

  return (
    <FilePond
      {...filePondProps}
      files={files}
      onupdatefiles={(filePondFiles: FilePondFile[]) => {
        setFiles(filePondFiles as unknown as NonNullable<FilePondProps["files"]>);
        onupdatefiles?.(filePondFiles);
        onChange?.(filePondFiles);
      }}
    />
  );
};

FileUploadComponent.displayName = "FileUpload";

const FileUpload = memo(FileUploadComponent);

export { FileUpload };
