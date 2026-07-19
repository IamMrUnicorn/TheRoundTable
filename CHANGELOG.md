# Changelog

All notable changes to The Round Table V5 are documented in this file.

This project follows the spirit of [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). V5 is a ground-up rebuild, so this first entry records both the new application foundation and the first complete campaign workflow. The previous `TheRoundTable-Client` and `TheRoundTable-Server` directories remain in the repository as historical reference while the new application is developed under `apps/web`.

## [Unreleased]

### Added

- Added targeted, expiring reaction prompts with GM-selected characters, custom interrupt text, 5–300 second countdowns, and player accept/decline controls.
- Added a restricted reaction-response RPC that hides prompts from unrelated players, rejects forged or expired answers, permits only the targeted owner to respond once, and records the result as a structured session event.
- Added one-second cross-browser prompt refresh, visible expiry/result history, indexed storage, explicit grants, and multi-user authorization tests.
- Added automatic, exactly-once projection of approved action proposals into the immutable structured session event log, including action kind, approval mode, proposal identity, reviewer, details, and GM ruling.
- Added Game Master editing of pending action type, title, and details before approval, with responsive inline edit controls.
- Added trigger-level integration tests proving pending actions never log early, approved actions log once, and subsequent proposal edits cannot duplicate session history.
- Added a contextual dashboard “Your next step” guide that derives one primary action from the signed-in user’s campaigns, characters, scheduled sessions, 18-hour room eligibility, live status, and GM/player role.
- Added a visible Join party → Create character → Schedule → Wait/Prep/Play checklist and role-specific links directly to scheduling, waiting rooms, DM preparation, or active play.
- Added shared workflow breadcrumbs across campaign, scheduling, waiting/preparation, and play pages so users can identify their current stage and navigate backward without remembering route rules.
- Replaced the Actions workspace placeholder with a shared player-intent composer covering attacks, magic, items, movement, speech, and custom actions.
- Added soft approval for ordinary declarations and hard approval requests with a three-second synchronized Game Master queue, written rulings, approve, deny, and clarification outcomes.
- Added character-attributed proposal history, responsive action cards, indexed hosted storage, explicit grants, and RLS tests proving players cannot approve their own exceptional requests.
- Added persistent per-combatant action economy for actions, bonus actions, reactions, object interactions, and movement spent during live initiative.
- Added active-turn-aware controls, automatic incoming-turn resource resets, reaction use outside the active turn, character-speed movement context, and three-second shared-state refresh.
- Extended initiative RLS tests to prove owners can change their own resources while other players cannot, with database constraints preventing impossible movement values.
- Added the supplied black-and-gold owl artwork as The Round Table's shared navigation, sign-in, loading, Apple touch, and browser-tab branding, with transparent optimized size variants and the browser title `TheRoundTable`.
- Added persistent session initiative with Dexterity-aware d20 rolls, manual initiative entry, shared descending turn order, active-turn highlighting, automatic round advancement, and manager reset controls.
- Added owner-aware initiative authorization: players can submit or revise only their own characters while Game Masters can manage the entire party and active encounter state.
- Added indexed encounter/initiative tables, explicit Data API grants, updated timestamps, hosted deployment, and multi-user RLS tests covering shared visibility and forged-roll rejection.
- Reorganized the live play screen into focused Actions & Dice, Party & Combat, and Session Log workspaces instead of one long vertical tool stack.
- Added an always-visible compact party rail with character links, current/maximum/temporary HP, and health meters.
- Added per-browser workspace persistence, accessible pressed-state tabs, lightweight view transitions, and a single-column mobile workspace layout.
- Added Supabase Realtime Presence to waiting rooms and active play screens with join/leave synchronization, connected-member ordering, connection-health feedback, and safe channel cleanup on navigation.
- Added a responsive session clock that counts down before the scheduled start and displays elapsed play time afterward, including paused-state context.
- Added refresh/reconnect recovery through persistent session routing, five-second lifecycle refresh, and automatic presence re-tracking after channel subscription.
- Added persisted per-player session readiness with a complete lobby roster, self-service ready/not-ready controls, five-second cross-browser refresh, and RLS protection against changing another member's state.
- Added Game Master pause and resume controls, a visible paused-session banner, and current-session discovery that treats paused play as an ongoing session.
- Extended the one-current-session database constraint across both active and paused sessions and added integration coverage for lifecycle transitions and readiness authorization.
- Added a persistent authenticated navigation bar with direct Characters, Parties, Calendar, Current Session, and Profile destinations.
- Added focused character and calendar hubs so users no longer need to find those collections inside the dashboard feature stack.
- Added role-aware Current Session discovery: active sessions and sessions beginning within 18 hours route players to a waiting room and campaign managers to DM preparation.
- Added a dedicated session route that automatically becomes the live play screen shortly after the Game Master starts play, with campaign context and a clear return path.
- Added sticky campaign section tabs for instant jumps to overview, story, logistics, party, sessions, and administration.
- Moved live session tools out of the campaign page and replaced ambiguous embedded controls with explicit Waiting Room, DM Prep, and Play Screen actions.
- Added an authenticated profile/preferences page with editable display name and IANA timezone.
- Added timezone, cadence, and preferred session-duration fields to campaigns as prerequisites for collaborative scheduling.
- Added owner-only campaign settings, invite-code rotation, member role management, and member removal controls.
- Added self-service campaign leaving for non-owner members.
- Added the hosted scheduling foundation for recurring availability, date-specific exceptions, proposed/scheduled sessions, and attendance responses.
- Added manager-aware scheduling permissions so campaign owners and Game Masters can manage sessions while members control only their own availability and attendance.
- Added a visible campaign scheduling page for weekly availability, preferred windows, date-specific exceptions, session proposals, agendas, and attendance responses.
- Added automatic recurring-overlap recommendations ranked by preferred votes, with one-click proposal prefilling for campaign managers.
- Added session confirmation, rescheduling, completion, cancellation, party response totals, and self-service exception deletion.
- Added manager-authored campaign announcements with pinned priority, author attribution, member visibility, and manager-only deletion.
- Added private in-app notifications for new announcements and session changes, including unread state, individual/all read controls, and a dashboard inbox.
- Added direct, email-targeted campaign invitations with manager-selected member roles, two-week expiration, and manager cancellation controls.
- Added a dashboard invitation inbox where recipients can accept or decline invitations addressed to their trusted account email.
- Added an upcoming-session dashboard that summarizes proposed, scheduled, and active sessions with campaign context, local date/time, lifecycle status, and the signed-in member's attendance response.
- Added a campaign-home next-session panel with agenda, lifecycle state, localized date/time, party attendance totals, the current member's response, and a direct route to session scheduling.
- Added campaign availability readiness showing how many members supplied recurring hours, the number of preferred windows, and upcoming exception totals by availability type.
- Added a campaign session-history archive for completed and cancelled sessions with dates, agendas, attendance-response totals, and a route back to the full campaign calendar.
- Added a campaign knowledge library where members can create and maintain shared notes or safe HTTP(S) linked resources, with author attribution and update timestamps.
- Added Game Master-only notes enforced by Row Level Security so private preparation never appears in ordinary member queries.
- Added manager-controlled pinning, full create/edit/delete interactions, responsive campaign-library layouts, supporting indexes, explicit least-privilege grants, and multi-user authorization tests.
- Added persistent campaign world state covering current location, in-world date/time, weather, public story context, and a physically separate Game Master secret state.
- Added a quest and objective board with priorities, active/completed/failed/abandoned lifecycles, public and GM-only objectives, and manager controls.
- Added responsive world/objective interfaces plus multi-user RLS coverage proving members can read public story state but cannot mutate it or retrieve Game Master secrets.
- Added collaborative party inventory with categories, quantities, units, holders, descriptions, and quick increment/decrement controls.
- Added preparation and downtime task tracking with member assignment, optional deadlines, to-do/in-progress/done states, and Game Master-only tasks.
- Added responsive logistics interfaces and multi-user authorization tests covering shared inventory changes, hidden tasks, assignment, and task completion.
- Added a searchable campaign encyclopedia for NPCs, factions, and locations with summaries, detailed notes, statuses, tags, type filters, and GM-only secret entries.
- Added manager creation, status editing, deletion controls, responsive reference cards, indexed queries, explicit grants, and RLS tests proving secret references remain hidden from party members.
- Added an RLS-aware campaign activity feed combining recent sessions, announcements, knowledge, objectives, inventory, tasks, NPCs, factions, and locations.
- Added atomic campaign ownership transfer to an active member, with locked validation, synchronized owner membership roles, confirmation UI, and retention of the former owner as a Game Master.
- Added optional approval-required invite-code joining, owner approval controls, persistent bans that block rejoining, and ban-lifting administration.
- Added rules-aware character saving throws, all eighteen core skills, proficiency and expertise choices, level-derived proficiency bonus, initiative, speed, and passive Perception, Investigation, and Insight.
- Added character survivability tracking for temporary HP, hit-die type and usage, death-save successes and failures, exhaustion, inspiration, and all standard conditions with database-enforced valid ranges.
- Added responsive rest, recovery, and condition controls to character sheets with visible save success/error feedback and read-only party visibility.
- Defined the responsive four-tab character workspace roadmap covering Quick View, Extra Details, adaptive Abilities & Spells, and provenance-backed Memory views.
- Added the first tabbed character workspace with persistent navigation, a focused Quick View, a complete Extra Details editor, an adaptive abilities placeholder, and a dedicated player-memory notes surface.
- Added constrained character identity, physical description, appearance, biography, personality, relationship, language, and senses storage plus rules-aware carrying, pushing, dragging, and lifting summaries based on Strength and creature size.
- Added character class, subclass, ancestry, background, feat, passive, resource, and custom-feature records with sources, descriptions, acquisition levels, ordering, active state, optional use counters, and recovery rules.
- Replaced the Abilities & Spells placeholder with an adaptive feature library where owners can add and remove abilities and spend or restore limited resources while party members receive read-only visibility.
- Added parent-character-aware RLS, explicit Data API grants, supporting indexes, timestamps, relational cleanup, and multi-user tests for feature visibility, owner-only mutation, and impossible resource-count rejection.
- Added optional multi-source spellcasting profiles with casting ability, preparation mode, save DC, attack bonus, prepared limits, and pact-magic identification.
- Added cantrips and leveled spells with prepared and favorite state plus ritual, concentration, school, casting-time, range, duration, component, and description metadata.
- Added level-based spell-slot pools with spendable remaining counts, responsive spell grouping, non-spellcaster empty states, owner-only changes, party visibility, and database enforcement preventing overfilled slots.
- Added structured character memories for notes, items, relationships, locations, discoveries, objectives, damage, healing, rests, conditions, rolls, actions, and custom events.
- Added private or party-shared memory visibility, campaign/session provenance, real and in-world time, locations, sources, references, player annotations, tags, pins, and extensible structured metadata.
- Added a searchable and filterable Memory timeline with manual capture, sharing and privacy controls, responsive provenance summaries, and RLS tests proving private memories never leak to party members.
- Added character-owned inventory and equipment with quantities, categories, locations, per-item weight, value, descriptions, equipped/attuned state, and responsive controls inside Memory.
- Added database-generated inventory memories so item gains, quantity/equipment changes, and removals retain an automatic, structured provenance trail without relying on client-side duplicate writes.
- Added an append-only structured session event log for narration, dialogue, actions, rolls, damage, healing, conditions, items, discoveries, locations, objectives, rests, and notes.
- Added party and GM-only event visibility, actor and optional character attribution, in-world time and location provenance, and automatic projection of party-visible character events into the Character Memory timeline.
- Added session-scoped realtime event delivery with visible connection status plus client-side search, event-type filters, and participant filters.
- Added Game Master start/end controls and database enforcement preventing more than one active session per campaign.
- Added a bounded polyhedral formula engine supporting multiple dice pools, signed modifiers, advantage, disadvantage, and cryptographically sourced browser rolls.
- Added public and private Game Master rolls, optional character attribution, manual physical-dice results, detailed roll breakdowns, structured metadata, and immutable session-log recording.
- Added live party health cards with current/max/temporary HP meters and owner-or-Game-Master controls for damage, healing, and temporary HP.
- Added an atomic health workflow that absorbs damage through temporary HP, caps healing at maximum HP, locks concurrent character updates, and records every accepted change in both session history and Character Memory.
- Added atomic condition add/remove controls, concentration source tracking, and death-save success/failure/reset controls to the live combat workspace.
- Added permission-checked status history carrying before/after conditions, concentration, and death-save counters into structured session events and Character Memory.
- Moved the primary Game Master start-session action into the Next Session card, added an active-session jump link, and clarified the empty-session scheduling instructions.
- Added an atomic invitation-response database workflow that validates the authenticated email, prevents expired or reused invitations, and creates campaign membership on acceptance.
- Added least-privilege grants, Row Level Security, supporting indexes, and three-user integration coverage for the complete invitation lifecycle.
- Added player-owned characters with optional campaign assignment.
- Added a character collection to the main dashboard and a streamlined character creation flow.
- Added editable character sheets covering identity, ancestry, class, subclass, background, level, hit points, armor class, six core abilities, and notes.
- Added computed ability modifiers and read-only sheets for fellow campaign members.
- Added party character listings inside campaign workspaces.
- Added constrained character storage, indexed owner/campaign relationships, automatic timestamps, least-privilege grants, and complete Row Level Security policies.
- Added integration coverage proving campaign members can view assigned characters while only character owners can modify them.

### Planned

- Character creation and character-to-campaign assignment.
- Campaign member management for Game Masters.
- Session scheduling, campaign notes, and preparation tools.
- Character sheets, party views, encounters, initiative, and live tabletop features.
- Production email delivery through a custom SMTP provider.
- Broader component and browser-level end-to-end test coverage.

## [5.0.0-foundation] - 2026-07-17

### Overview

- Began V5 as a clean rebuild rather than continuing to layer changes onto the earlier client/server architecture.
- Preserved the central product concept from V2 and V4: Game Masters create campaign rooms, players join parties, and campaign membership controls access.
- Replaced the earlier prototype flow with a typed React application backed directly by Supabase Auth, Postgres, Row Level Security, and generated database types.
- Established campaigns as the first complete vertical slice, from authentication and database authorization through the hosted user interface.

### Application foundation

- Added an npm workspace at the repository root with the new web application located at `apps/web`.
- Standardized development on Node.js 24 through `.nvmrc` and the root package engine declaration.
- Added root commands for development, production builds, linting, tests, formatting, database tests, and consolidated verification.
- Added and locked the V5 dependency set, including:
  - React 19 and React DOM.
  - TypeScript 6.
  - Vite 8.
  - React Router.
  - TanStack Query.
  - Supabase JavaScript client.
  - Zod and React Hook Form for future validated forms.
  - Lucide icons.
  - Tailwind CSS tooling.
  - Vitest and Testing Library.
  - oxlint and Prettier.
- Added repository ignore rules for environment files, dependencies, build output, coverage, and Supabase CLI state.
- Added a safe `.env.example` while keeping `.env.local` and its hosted Supabase publishable key out of version control.

### Authentication

- Added passwordless email authentication through Supabase magic links.
- Added a shared authentication provider that:
  - Loads trusted identity claims from the current Supabase session.
  - Responds to authentication state changes.
  - Exposes the authenticated user ID and email to protected application features.
  - Supports sign-out and immediate local identity cleanup.
- Added protected routes that redirect signed-out visitors to the sign-in page.
- Added signed-in redirects so authenticated users do not remain on the sign-in screen.
- Verified hosted magic-link sign-in against the new Supabase project.

### User interface

- Added a responsive dark green, parchment-gold visual foundation for V5.
- Added a dedicated magic-link sign-in screen with loading, success, and error feedback.
- Replaced the placeholder dashboard with a functional campaign hub.
- Added responsive application navigation and sign-out controls.
- Added campaign loading, empty, success, and failure states.
- Added accessible labels and semantic form controls for campaign creation and joining.
- Added mobile layouts for campaign actions, cards, workspace panels, and authentication screens.

### Campaign creation

- Added a campaign creation form with:
  - A required campaign name.
  - An optional description.
  - Client-side length constraints matching database constraints.
  - Pending and failure feedback.
- Added collision-resistant, URL-safe campaign slugs.
- Added automatic eight-character hexadecimal invite codes.
- Added automatic owner membership whenever a campaign is created.
- Added campaign status support for forming, active, paused, completed, and archived campaigns.
- Added automatic routing into the newly created campaign workspace.

### Campaign discovery and joining

- Added dashboard cards for every campaign the current user owns or has actively joined.
- Added membership role and campaign status indicators to campaign cards.
- Added secure invite-code joining with case-insensitive code normalization.
- Limited joinable campaigns to forming, active, or paused campaigns.
- Added safe rejoining for memberships previously marked declined or removed.
- Prevented invite codes from exposing campaign records before membership is established.
- Added automatic navigation into a campaign after a successful join.
- Added clear invalid or unavailable invite-code feedback.

### Campaign workspace

- Added protected campaign routes at `/campaigns/:campaignId`.
- Added campaign headers containing campaign name, description, and status.
- Added an invite-code card with clipboard copying.
- Added an active party roster showing shared campaign members and their roles.
- Added graceful loading and access-denied states for invalid or inaccessible campaign routes.
- Added the initial workspace structure that future sessions, characters, notes, encounters, and tabletop features can extend.

### Database schema

- Added declarative Supabase schemas under `supabase/schemas`.
- Added versioned and reproducible database migrations under `supabase/migrations`.
- Added `public.profiles` with:
  - A one-to-one foreign key to `auth.users`.
  - Display name and optional avatar path.
  - Created and updated timestamps.
- Added `public.campaigns` with:
  - Identity primary keys.
  - Profile-backed ownership.
  - Unique slugs and invite codes.
  - Constrained names, descriptions, and statuses.
  - Created and updated timestamps.
- Added `public.campaign_members` with:
  - Composite campaign/user primary keys.
  - Owner, Game Master, player, and observer roles.
  - Invited, active, declined, and removed states.
  - Joined, created, and updated timestamps.
- Added indexes supporting ownership lookups, membership listing, foreign keys, and RLS predicates.
- Added reusable timestamp triggers for mutable records.
- Added automatic profile creation after a new Supabase Auth user is inserted.
- Added automatic campaign-owner membership triggers.
- Added migration backfilling so pre-existing campaign owners receive owner memberships.

### Database security

- Enabled Row Level Security on every exposed public table.
- Revoked anonymous access to profiles, campaigns, campaign memberships, and campaign sequences.
- Granted authenticated users only the table operations required by the application.
- Restricted profile reads to the current user and active members of a shared campaign.
- Restricted profile updates to the owning user.
- Restricted campaign reads to owners and active campaign members.
- Restricted campaign creation, updates, and deletion to the appropriate owner identity.
- Restricted membership reads to the membership owner, campaign members, and campaign owner.
- Restricted membership administration to campaign owners while allowing users to leave their own campaigns.
- Added private, indexed membership and ownership helper functions for performant RLS checks.
- Added explicit `auth.uid()` validation inside privileged database functions.
- Set empty function search paths to prevent object-shadowing attacks.
- Revoked default function execution from `PUBLIC` and anonymous roles.
- Hardened the hosted platform `rls_auto_enable()` function by removing execution access from public client roles while retaining its internal event-trigger behavior.
- Split code-based campaign joining into:
  - A public `SECURITY INVOKER` RPC exposed to authenticated clients.
  - A private `SECURITY DEFINER` implementation that performs the protected invite-code lookup and membership write.
- Removed the hosted database advisor warning for an exposed authenticated `SECURITY DEFINER` RPC.

### Supabase development environment

- Added Supabase CLI configuration for local Postgres 17 development.
- Configured local authentication URLs for the Vite development server.
- Added local Studio, API, Auth, Storage, Realtime, and Mailpit services through the Supabase Docker stack.
- Added a seed file placeholder for future deterministic development fixtures.
- Linked the CLI to the new hosted Supabase project.
- Deployed and verified all V5 migrations against the hosted database.
- Generated TypeScript database types from the hosted schema for compile-time query safety.

### Testing and verification

- Added a repeatable database integration test using unique local users and campaigns on every run.
- Verified automatic profile creation after sign-up.
- Verified automatic owner membership after campaign creation.
- Verified outsiders cannot list campaigns before joining.
- Verified invite codes can be normalized and used to join securely.
- Verified joined users can list the campaign afterward.
- Verified active campaign members can see the appropriate shared profile information.
- Verified invalid invite codes fail without creating memberships.
- Verified anonymous users cannot access profiles.
- Added an application routing test for signed-out visitors.
- Added root verification commands that run linting, unit tests, TypeScript compilation, production builds, and formatting checks.
- Confirmed clean database resets can recreate the complete schema from migrations.
- Confirmed declarative schemas and migrations have zero drift.
- Confirmed database lint reports no schema errors.
- Confirmed local database advisors report no warning-level issues.
- Confirmed hosted database lint reports no schema errors.
- Confirmed npm reports no known dependency vulnerabilities at the time of this release.

### Hosted configuration notes

- The hosted project currently uses Supabase's default email provider for magic links.
- Supabase's default provider is intended for initial testing and currently has a very small project-wide email allowance, which can produce `email rate limit exceeded` during repeated multi-user tests.
- Local development can use Mailpit at `http://127.0.0.1:54324` without consuming hosted email allowance.
- A custom SMTP provider should be configured before production or broader user testing.
- Supabase currently reports leaked-password protection as disabled. V5 currently uses passwordless magic links, but this should still be reviewed if password authentication is introduced.
- Newly created indexes may appear as unused in hosted advisors until real campaign traffic exercises them; they are retained because they support foreign keys, membership queries, and RLS predicates.

### Tooling and infrastructure

- Installed and verified Docker Desktop integration for the local Supabase stack.
- Installed and pinned the local Supabase CLI.
- Updated the development runtime to Node.js 24 and npm 12.
- Added production build output reporting through Vite.
- Confirmed the complete dependency installation has no npm audit findings.

### Historical compatibility

- Kept the previous `TheRoundTable-Client` and `TheRoundTable-Server` implementations unchanged as product and feature references.
- Did not migrate the earlier custom Express, Socket.IO, and prototype SQL architecture into the V5 runtime.
- Deferred character sheets, spells, guides, maps, chat, audio, initiative, and live-game tools until they can be rebuilt on the new authenticated campaign and membership foundation.

[Unreleased]: https://github.com/IamMrUnicorn/TheRoundTable/compare/v5.0.0-foundation...HEAD
[5.0.0-foundation]: https://github.com/IamMrUnicorn/TheRoundTable/releases/tag/v5.0.0-foundation
