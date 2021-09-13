import { formatTime } from "../../../../utils/formatTime";
import s from "./messages.module.scss";

export const Text = ({
  msgPosition,
  timestamp,
  msgParams,
  extraParam,
}: any) => {
  const { text } = msgParams;
  return (
    <span className={msgPosition === "right" ? s.textRight : s.textLeft}>
      <div className={s.text}>
        {extraParam?.owner || extraParam.prevMsgBySameUser ? null : (
          <div
            style={{
              color: extraParam.color,
            }}
            className={s.sentBy}
          >
            {extraParam.by}
          </div>
        )}
        <p
          className={s.textMsg}
          dangerouslySetInnerHTML={{
            __html: text,
          }}
        />
        <div className={s.msgTiming}>
          <div>
            <small>{formatTime(timestamp)}</small>
            <small></small>
          </div>
        </div>
      </div>
    </span>
  );
};
