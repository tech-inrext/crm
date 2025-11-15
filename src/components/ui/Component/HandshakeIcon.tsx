import React from "react";
import Handshake from "@mui/icons-material/Handshake";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface HandshakeIconComponentProps extends SvgIconProps {}

const HandshakeIconComponent: React.FC<HandshakeIconComponentProps> = ({
  ...props
}) => {
  return <Handshake {...props} />;
};

export default HandshakeIconComponent;