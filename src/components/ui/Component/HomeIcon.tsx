import { Home as MuiHome } from "@mui/icons-material";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface HomeIconComponentProps extends SvgIconProps {}

const HomeIconComponent: React.FC<HomeIconComponentProps> = ({ ...props }) => {
  return <MuiHome {...props} />;
};

export default HomeIconComponent;
