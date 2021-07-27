import { Avatar } from "@material-ui/core";
import s from "./chatStyles.module.scss";
import { useContext } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { dropDownContext } from "../../context/dropDownContext";

export const SidebarChats = () => {
  const { dropMenu, setDropMenu } = useContext(dropDownContext);

  const handleDropMenuClicks = (e: any, type: string) => {
    e.preventDefault();
    if (!dropMenu) {
      setDropMenu({
        type,
        position: {
          x: e.clientX,
          y: e.clientY,
        },
        params: {},
      });
    } else {
      setDropMenu(false);
    }
  };

  return (
    <div
      onContextMenu={(e) => handleDropMenuClicks(e, "chatInfo")}
      className={s.sidebarChats}
    >
      <Avatar />
      <span className={s.chatInfo}>
        <div>
          <p>Blank</p>
          <p className={s.time}>Thursday</p>
        </div>
        <div>
          <small>
            Ipsom: Askjdh askjd aks dkjas kd aksjd hkasjdhkas dkjas kdjha skdj
            hkasjd kasj kdjash kdj hkasjhd k askdj aks jd
          </small>
          <ExpandMoreIcon
            onClick={(e) => handleDropMenuClicks(e, "chatInfo")}
            style={{
              height: 20,
              color: "rgb(130, 134, 137)",
            }}
          />
        </div>
      </span>
    </div>
  );
};
