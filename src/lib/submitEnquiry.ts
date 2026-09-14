/* ==========================================================================
   Enquiry submission
   --------------------------------------------------------------------------
   THIS IS THE ONLY PLACE THE SITE SENDS A FORM ANYWHERE.

   The site is frontend only at this stage, so by default this function does
   not transmit anything. It waits briefly and reports success, which lets the
   success states be built and reviewed without a backend behind them. Nothing
   is stored, and no data leaves the browser.

   To connect a real backend or a hosted form service:

     1. Set VITE_ENQUIRY_ENDPOINT in your environment (see .env.example).
     2. That is it. When the variable is present the payload below is POSTed
        as JSON to that URL and the real response decides the outcome.

   Adjust `body` here if the service you choose expects a different shape.
   ========================================================================== */

export type EnquiryPayload = {
  /** Which form the submission came from. */
  formName: 'founding-network' | 'contact';
  fields: Record<string, string>;
};

export type SubmitResult =
  | { ok: true }
  | { ok: false; message: string };

const SIMULATED_DELAY_MS = 700;

const GENERIC_ERROR =
  'Something went wrong sending your details. Please try again in a moment.';

export async function submitEnquiry(payload: EnquiryPayload): Promise<SubmitResult> {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT as string | undefined;

  if (!endpoint) {
    // Frontend-only placeholder. Replace by setting VITE_ENQUIRY_ENDPOINT.
    if (import.meta.env.DEV) {
      console.info('[ConnectCymru] Simulated submission, nothing was sent:', payload);
    }
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_DELAY_MS));
    return { ok: true };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return { ok: false, message: GENERIC_ERROR };
    return { ok: true };
  } catch {
    return { ok: false, message: GENERIC_ERROR };
  }
}
