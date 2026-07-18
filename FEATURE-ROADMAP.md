# The Round Table V5 — Master Feature Roadmap

This is the source-of-truth checklist for the entire application. Completed work is checked here as it is verified. Detailed live-session implementation is expanded in [ROADMAP.md](./ROADMAP.md).

## 0. Proven V5 foundation

- [x] React/TypeScript application workspace and production build.
- [x] Passwordless Supabase authentication and protected routes.
- [x] Automatic user profiles.
- [x] Campaign creation, invite codes, and multi-user joining.
- [x] Campaign membership roles and database isolation.
- [x] Campaign workspace and party roster.
- [x] Player-owned characters with campaign assignment.
- [x] Owner-editable and party-readable character sheets.
- [x] Hosted migrations, generated types, RLS integration tests, linting, and advisors.

## 1. Accounts and profiles

- [ ] Edit display name and avatar. *(Display-name editing complete; avatar pending.)*
- [ ] Timezone, locale, and scheduling defaults. *(User timezone complete; locale/defaults pending.)*
- [ ] Notification preferences.
- [ ] Accessibility and interface preferences.
- [ ] Experience level, preferred systems, roles, and play styles.
- [ ] Privacy controls.
- [ ] Account deletion and user-owned data export.
- [ ] Blocking/reporting if public discovery is introduced.

## 2. Dashboard and personal organization

- [x] Active campaign list.
- [x] Personal character collection.
- [x] Upcoming-session overview.
- [ ] Availability requests requiring a response.
- [x] Pending invitations and unread announcements.
- [ ] Recent campaign activity.
- [ ] Character updates requiring attention.
- [ ] Recently opened notes/sheets and preparation shortcuts.
- [x] In-app notification center.

## 3. Campaign administration

- [x] Create campaigns and join with invite codes.
- [x] Owner, Game Master, player, and observer role model.
- [ ] Campaign name, description, image, status, and archive settings. *(Settings complete except image.)*
- [ ] Ruleset/edition, campaign timezone, cadence, and expected duration. *(Scheduling fields stored; settings UI pending.)*
- [ ] House rules, content warnings, and safety preferences.
- [ ] Co-GM assignment and granular permissions. *(Game Master role assignment complete.)*
- [x] Approve, remove, or ban members; voluntarily leave a campaign.
- [x] Safe ownership transfer.
- [x] Rotate/revoke invite codes and optionally require join approval.

## 4. Collaborative scheduling and calendar

- [ ] Personal availability calendar. *(Functional scheduling page and list UI complete; visual calendar grid pending.)*
- [x] Available, unavailable, and preferred time ranges.
- [x] Recurring weekly availability plus date-specific exceptions.
- [ ] Timezone-aware storage, display, and daylight-saving handling.
- [ ] Weekly, biweekly, and monthly campaign cadence.
- [ ] Minimum/preferred session duration and earliest/latest times.
- [ ] Required versus optional attendees.
- [x] Automatic overlap calculation across campaign members.
- [ ] Ranked recommendations: everyone available, most available, most preferred, and cadence fit. *(Everyone-available and preferred-vote ranking complete; partial-attendance/cadence ranking pending.)*
- [ ] Explain why each time was recommended.
- [ ] Member voting between suggested times.
- [x] DM confirmation, rescheduling, cancellation, and attendance responses.
- [ ] Scheduling deadline and response reminders.
- [ ] `.ics` calendar export.
- [ ] Later: Google Calendar, Outlook, and Discord integration.

## 5. Campaign home and shared information

- [x] Party roster and assigned characters.
- [x] Next session, attendance, and availability summary.
- [x] Announcements and pinned resources.
- [x] Shared handouts and campaign notes.
- [x] Private Game Master notes.
- [x] Current quests, objectives, and party inventory.
- [x] Campaign calendar and session history.
- [x] Current location, in-world date/time, weather, and world state.
- [x] NPC, faction, and location references.
- [x] Downtime activities and preparation checklist.
- [x] Campaign activity feed.

## 6. Invitations and notifications

- [x] Join codes.
- [ ] Direct email invitations and invitation links. *(Email-targeted in-app invitations complete; outbound email delivery and shareable links pending.)*
- [x] Pending invitation screen with accept/decline.
- [ ] Optional member-approval workflow.
- [ ] Session, scheduling, announcement, and character notifications. *(Session and announcement notifications complete.)*
- [ ] Email, browser, and in-app delivery preferences.
- [ ] Custom SMTP for production email.
- [ ] Later: Discord notifications.

## 7. Character system

- [x] Quick manual character creation.
- [x] Identity, ancestry, class, subclass, background, level, HP, AC, abilities, and notes.
- [x] Campaign assignment and read-only party visibility.
- [ ] Skills, saving throws, proficiency, initiative, passive senses, speed, and derived values.
- [ ] Hit dice, death saves, exhaustion, inspiration, and conditions.
- [ ] Features, feats, languages, senses, movement, appearance, and biography.
- [ ] Multiclass and level-up workflows with history.
- [ ] Portrait and token artwork.
- [ ] Private player fields and private GM fields.
- [ ] Assignment approval, retirement, death, duplication, print, and export.
- [ ] Guided new-character wizard with save/resume.
- [ ] Rules-aware choices and automatic calculations.
- [ ] Established-character import with preview, mapping, validation, and conflict handling.

## 8. Game Master preparation

- [ ] Session preparation pages, agendas, and templates.
- [ ] Encounter builder and difficulty estimation.
- [ ] Monster/NPC, location, scene, quest, handout, and loot libraries.
- [ ] Secret GM notes and random tables.
- [ ] Initiative groups, map preparation, and audio playlists.
- [ ] Reusable preparation content across sessions/campaigns.

## 9. Rules and compendium

- [ ] Searchable spells, monsters, items, equipment, conditions, classes, ancestries, backgrounds, feats, and rules.
- [ ] Filters, favorites, source/version attribution, and campaign-allowed content.
- [ ] Custom/homebrew content.
- [ ] Link entries into characters, notes, encounters, and actions.
- [ ] Review licensing before shipping copyrighted rules content.

## 10. Live session and play screen

- [ ] Waiting room, start/pause/resume/end lifecycle, and one active session per campaign.
- [ ] Realtime presence, connection state, refresh recovery, and session timer.
- [ ] Modular/resizable notebook, central stage, party rail, action bar, drawers, and overlays.
- [ ] Persistent structured event log, chat, speech, mentions, and filters.
- [ ] Dice formulas, private rolls, checks, saves, attacks, damage, and initiative.
- [ ] Encounters, initiative ordering, rounds, turns, and active-turn controls.
- [ ] Action, bonus action, movement, object interaction, and reaction tracking.
- [ ] Player action proposals and Game Master approve/deny/edit/clarify flow.
- [ ] Reaction prompts with accept/decline and expiration.
- [ ] HP, temporary HP, healing, damage, death saves, concentration, and conditions.
- [ ] Character, spell, inventory, monster, and action overlays.
- [ ] Complete Phase 3 theater-of-the-mind milestone described in `ROADMAP.md`.

## 11. Inventory, equipment, spells, and reusable actions

- [ ] Inventory quantity, weight, value, currency, charges, containers, and carrying capacity.
- [ ] Equip/unequip, armor, weapons, tools, consumables, magic items, and attunement.
- [ ] Use, give, transfer, drop, and GM-grant item workflows.
- [ ] Known/prepared spells, slots, rituals, cantrips, concentration, components, and upcasting.
- [ ] Spell attack/save calculations and target selection.
- [ ] Actions derived from equipment, spells, features, and custom entries.
- [ ] Resource costs, limited uses, and rest recovery.

## 12. Notebook and campaign knowledge

- [ ] Multiple pages, folders, tags, search, and backlinks.
- [ ] Rich text, checklists, tables, links, and embedded references.
- [ ] Freehand drawings and simple shapes.
- [ ] Autosave and offline draft protection.
- [ ] Private, party-shared, and GM-shared permissions.
- [ ] Pinned live-session pages and non-destructive GM overlays.
- [ ] Session-linked notes and recap links.

## 13. Maps, scenes, and tokens

- [ ] Scene/map upload, library, switching, preview, grids, scale, snapping, and measurement.
- [ ] Layered maps, drawings, tokens, effects, and GM-only information.
- [ ] Character, monster, NPC, object, and marker tokens.
- [ ] Ownership, movement permissions, grouping, locking, z-order, auras, labels, and health bars.
- [ ] Fog of war, reveal tools, line of sight, and hidden tokens.
- [ ] DM camera/viewport broadcast.
- [ ] Pen, shapes, arrows, text, eraser, styling, undo/redo, and temporary drawings.
- [ ] Spell/effect distance and area templates.

## 14. Monster, NPC, and encounter tools

- [ ] Searchable monster/NPC library and custom stat blocks.
- [ ] Traits, actions, reactions, legendary actions, spells, loot, and private values.
- [ ] Add creatures to encounters, maps, and initiative.
- [ ] Batch/individual HP and condition controls.
- [ ] NPC relationships and location tracking.
- [ ] Reusable encounter templates.

## 15. Audio and atmosphere

- [ ] Music library, metadata, artwork, progress, and volume.
- [ ] Ambient loops and one-shot effects.
- [ ] GM-synchronized playback with per-user volume/mute.
- [ ] Playlists and scene-linked audio.
- [ ] Browser autoplay fallback behavior.

## 16. Post-session continuity

- [ ] End-session recap workflow and player-contributed highlights.
- [ ] Attendance, duration, encounters, rewards, experience/milestones, and loot summary.
- [ ] Resource recovery and persistent-condition review.
- [ ] Quest/world updates and searchable session timeline.
- [ ] “Previously on…” summary.
- [ ] Schedule-next-session prompt.
- [ ] Exportable recap and session log.

## 17. Looking for group and community — later phase

- [ ] Public/private listings and player/GM profiles.
- [ ] System, timezone, schedule, role, and play-style matching.
- [ ] Applications, questions, group matching, and session-zero expectations.
- [ ] Safety, blocking, reporting, and moderation tools.

## 18. Safety and accessibility

- [ ] Lines/veils, content warnings, anonymous safety signals, and pause/stop tools.
- [ ] Private GM communication.
- [ ] Keyboard navigation and screen-reader support.
- [ ] Colorblind-safe indicators, reduced motion, scalable text, and high contrast.
- [ ] Captions/transcripts if voice/video is ever introduced.

## 19. Platform, reliability, and quality

- [ ] Autosave, reconnect recovery, idempotent commands, conflict resolution, and audit history.
- [ ] Rate limits, upload security, backups, retention, and user data export.
- [ ] Error/performance monitoring and realistic realtime load testing.
- [ ] RLS tests for owner, GM, player, observer, outsider, and anonymous identities.
- [ ] Unit tests for derived rules and integration tests for session/turn state.
- [ ] Multi-browser realtime and full end-to-end tests.
- [ ] Admin/moderation tools, feature flags, staged releases, privacy policy, and terms.
- [ ] Mobile companion experience and later installable PWA.

## 20. UI/UX refinement — continuous, dedicated pass after core systems

- [ ] Consistent pending, success, error, empty, and disabled states.
- [ ] Toasts, inline feedback, destructive confirmations, and copied-state feedback.
- [ ] Tooltips and explanations for unavailable actions.
- [ ] Keyboard shortcuts and command palette.
- [ ] Focus management and screen-reader announcements.
- [ ] Player/GM onboarding tours and responsive companion layouts.

## Current implementation order

1. [ ] Profiles, campaign settings, roles, and membership administration.
2. [ ] Availability calendar and scheduling recommendation engine.
3. [ ] Invitations, notifications, and expanded campaign home.
4. [ ] Live-session foundation and structured event log.
5. [ ] Theater-of-the-mind combat loop.
6. [ ] Deeper characters, inventory, spells, and actions.
7. [ ] GM preparation, compendium, notes, maps, tokens, and audio.
8. [ ] Post-session continuity, integrations, community, and comprehensive polish.
