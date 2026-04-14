"use client";
import React from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Divider,
  Check,
  CloseIcon,
} from "@/components/ui/Component";
import { MouCardProps } from "../types";
import { getInitials } from "../utils";
import {
  cardPaperSx,
  mainStackSx,
  headerStackSx,
  infoStackSx,
  avatarSx,
  nameSx,
  emailSx,
  designationSx,
  actionWrapperSx,
  buttonGroupSx,
  approveBtnSx,
  rejectBtnSx,
  previewBtnSx,
  resendBtnSx,
} from "./styles";

const MouCard: React.FC<MouCardProps> = ({
  emp,
  view,
  onApproveConfirm,
  onRejectConfirm,
  onPreview,
  onResend,
}) => {
  return (
    <Paper sx={cardPaperSx} elevation={1}>
      <Box sx={mainStackSx}>
        <Box sx={headerStackSx}>
          <Box sx={infoStackSx}>
            <Avatar sx={avatarSx}>{getInitials(emp.name)}</Avatar>
            <Box>
              <Typography sx={nameSx}>{emp.name}</Typography>
              <Typography sx={emailSx}>{emp.email}</Typography>
              {emp.designation && (
                <Typography sx={designationSx}>{emp.designation}</Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={actionWrapperSx}>
          <Divider />
          <Box sx={buttonGroupSx}>
            {(view === "pending" || (!view && emp.mouStatus === "Pending")) && (
              <>
                <Button
                  type="button"
                  size="medium"
                  color="success"
                  variant="contained"
                  startIcon={<Check fontSize="small" />}
                  onClick={() => {
                    if (!emp._id) return;
                    onApproveConfirm(emp._id);
                  }}
                  sx={approveBtnSx}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="medium"
                  color="error"
                  variant="outlined"
                  startIcon={<CloseIcon fontSize="small" />}
                  onClick={() => {
                    if (!emp._id) return;
                    onRejectConfirm(emp._id);
                  }}
                  sx={rejectBtnSx}
                >
                  Reject
                </Button>
              </>
            )}

            {(view === "completed" ||
              (!view &&
                (emp.mouStatus === "Completed" ||
                  emp.mouStatus === "Approved"))) && (
              <>
                <Button
                  type="button"
                  size="medium"
                  variant="outlined"
                  onClick={() => {
                    if (!emp._id) return;
                    onPreview(emp._id);
                  }}
                  sx={previewBtnSx}
                >
                  Preview
                </Button>
                <Button
                  type="button"
                  size="medium"
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    if (!emp._id) return;
                    if (onResend) onResend(emp._id);
                  }}
                  sx={resendBtnSx}
                >
                  Resend Mail
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default MouCard;
