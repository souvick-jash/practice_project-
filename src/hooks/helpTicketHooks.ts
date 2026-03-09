import supabase from "@/configs/supabse";
import useAuthStore from "@/store/authStore";
import { timeConverter } from "@/utils/time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validStoreLocation } from "./generalHooks";

type HelpTicketInput = {
  message: string | null;
  store_location_id: string | null;
};

// * ====================== Fetch All Genie Requests ====================== *
const fetchAllGenieRequests = async () => {
  const { data, error } = await supabase
    .from("help_tickets")
    .select(
      `
      *,
      store_location:store_locations (
        id, name
      ),
      requested_by:users!requested_by_user_id (
       id, name, unique_id
      )
      `,
    )
    .order("created_at", { ascending: false });

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchAllGenieRequests = () => {
  return useQuery({
    queryKey: ["help_tickets"],
    queryFn: fetchAllGenieRequests,
    staleTime: timeConverter(20, "minute"),
  });
};

// * ====================== Fetch Single Genie Requests ====================== *
const fetchSingleGenieRequest = async (ticketId: string) => {
  const { data, error } = await supabase
    .from("help_tickets")
    .select(
      `
      *,
      store_location:store_locations (
        id, name
      )
      `,
    )
    .eq("id", ticketId)
    .maybeSingle();

  const result = data;

  if (error) throw error;
  return result;
};

export const useFetchSingleGenieRequest = (ticketId: string) => {
  return useQuery({
    queryKey: ["help_ticket", ticketId],
    queryFn: () => fetchSingleGenieRequest(ticketId),
    staleTime: timeConverter(20, "minute"),
  });
};

// * ====================== Create Help Ticket ====================== *
export const createHelpTicket = async (helpTicketData: HelpTicketInput) => {
  const triggerMail = import.meta.env.VITE_SEND_HELP_TICKET_MAIL;

  const { store_location_id, message } = helpTicketData;

  // ? ---------- Store Location Check -----------
  const isValid = await validStoreLocation(store_location_id);
  if (!isValid) {
    throw new Error("Store location is not valid");
  }

  const userProfile = useAuthStore.getState().userProfile;
  const requested_by_user_id = userProfile?.id;
  const requester_name = userProfile?.name;
  const requester_email = userProfile?.email;

  // Insert Data
  const { error: dbError, data: insertedData } = await supabase
    .from("help_tickets")
    .insert({
      requester_name,
      requester_email,
      message,
      requested_by_user_id,
      created_at: new Date().toISOString(),
      store_location_id,
    })
    .select();

  if (dbError || !insertedData?.length) {
    throw dbError || new Error("Failed to insert record");
  }

  const insertedId = insertedData[0].id;
  if (!insertedId) {
    throw new Error("Failed to insert record");
  }

  if (triggerMail === "true") {
    // Invoke Edge Function
    const { data: fnData, error: fnError } = await supabase.functions.invoke(
      "send-help-ticket-mail",
      {
        body: JSON.stringify({
          requester_name,
          requester_email,
          message,
        }),
      },
    );
    if (fnError) {
      // console.error('Help ticket mail function failed:', fnError);
      throw new Error("Failed to send help ticket mail");
    }

    // Optionally check function's returned payload
    if (!fnData?.success) {
      // console.error('Help ticket mail function did not return success:', fnData);
      throw new Error("Help ticket mail did not complete successfully");
    }
  }
  return {
    success: true,
    ticketId: insertedId,
  };
};

export const useCreateHelpTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHelpTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["help_tickets"],
        exact: false,
      });
    },
  });
};
