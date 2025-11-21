"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from "@/components/ui/Component";
import axios from "axios";

const ApprovedMouPage: React.FC = () => {
  const params: any = useParams();
  const id = params?.id;
  const router = useRouter();

  const [mou, setMou] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    axios
      .get(`/api/v0/employee/${id}`)
      .then((res) => {
        if (mounted) setMou(res.data.data || res.data);
      })
      .catch((e) => console.error(e))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSend = async () => {
    if (!id) return;
    try {
      setSending(true);
      const resp = await axios.post(`/api/v0/mou/pdf/send`, { id });
      alert(resp.data.message || "Email sent");
      // after sending, navigate back to MOU list
      router.push("/dashboard/mou");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box className="container mx-auto px-4 py-6" sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">MOU Preview</Typography>
          <Box>
            <Button
              variant="outlined"
              onClick={() => router.push("/dashboard/mou")}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSend}
              disabled={sending || !mou}
            >
              {sending ? <CircularProgress size={18} /> : "Send"}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>
                <strong>Associate:</strong> {mou?.username} — {mou?.email}
              </Typography>
              <Box sx={{ height: "800px" }}>
                <iframe
                  src={`/api/v0/mou/pdf/preview?id=${id}`}
                  style={{ width: "100%", height: "100%", border: "none" }}
                />
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ApprovedMouPage;
