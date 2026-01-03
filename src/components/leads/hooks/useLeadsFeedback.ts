import { useState, useCallback } from "react";

export function useLeadsFeedback() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedLeadForFeedback, setSelectedLeadForFeedback] = useState<
    string | null
  >(null);

  const openFeedback = useCallback((leadId: string) => {
    setSelectedLeadForFeedback(leadId);
    setFeedbackOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setFeedbackOpen(false);
    setSelectedLeadForFeedback(null);
  }, []);

  return {
    feedbackOpen,
    selectedLeadForFeedback,
    openFeedback,
    closeFeedback,
  };
}
