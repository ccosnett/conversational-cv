# Conversational CV

An interactive voice-based CV for exploring Conor Cosnett's background,
projects, technical strengths, and role preferences through conversation.

## What this repo does

This is a tiny Next.js app wrapped around Hume EVI.

- The web app handles the call UI and transcript.
- The server mints a short-lived Hume access token.
- The session is grounded from local content files in `content/`.
- If `HUME_CONFIG_ID` is set, Hume can also use a saved config and custom voice.

## Grounding files

The fastest way to improve the demo is to edit these files:

- `content/profile.md`
- `content/experience.md`
- `content/faq.md`

Those files are combined into the session prompt that is sent to Hume on every
call.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and set:

   - `HUME_API_KEY`
   - `HUME_SECRET_KEY`
   - `HUME_CONFIG_ID` (optional but recommended if you want your own saved voice)

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Deployment

Deploy on Vercel and add the same environment variables in the project
settings.

## Product intention

The original project brief lives in [intention.md](./intention.md).
