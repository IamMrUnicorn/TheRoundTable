# The Round Table V5 Roadmap

This roadmap translates the play-screen sketch and the proven V5 foundations into a dependency-ordered implementation plan. The goal is to reach a genuinely playable session early, then add the deeper virtual-tabletop tools without coupling every feature into one oversized component.

## Product principles

- The server/database owns authoritative session, turn, combat, and permission state.
- The Game Master controls what players can see and which proposed actions are accepted.
- Players can prepare private information without exposing it to the rest of the party.
- Every live-session feature must recover cleanly after refresh or reconnect.
- Character sheets, notebooks, compendiums, and maps remain useful outside a live session.
- Desktop is the primary play surface; smaller screens receive a focused companion layout.
- Accessibility, keyboard navigation, loading feedback, and clear errors are requirements, even when visual polish is deferred.

## Completed foundation

- [x] Passwordless authentication and protected routes.
- [x] Automatic user profiles.
- [x] Campaign creation and invite-code joining.
- [x] Campaign membership isolation with Row Level Security.
- [x] Campaign workspace and party roster.
- [x] Character creation and optional campaign assignment.
- [x] Owner-editable, party-readable character sheets.
- [x] Core character identity, HP, armor class, level, abilities, and notes.
- [x] Local database integration tests and hosted migration workflow.

## Phase 1 — Campaign operations

### Campaign settings and membership

- [ ] Campaign settings page for name, description, status, and archive controls.
- [ ] Regenerate/revoke campaign invite codes.
- [ ] Member role management: owner, Game Master, player, observer.
- [ ] Remove members and allow members to leave campaigns.
- [ ] Transfer campaign ownership safely.
- [ ] Pending invitation/approval mode as an alternative to instant code joining.
- [ ] Campaign-level rules configuration and optional system/version metadata.

### Session scheduling

- [ ] Create, edit, cancel, and complete scheduled sessions.
- [ ] Start/end time, timezone, title, agenda, and preparation notes.
- [ ] Attendance responses: attending, tentative, absent, unanswered.
- [ ] Upcoming-session card on dashboard and campaign workspace.
- [ ] Session history with summaries and duration.
- [ ] “Start session” permission restricted to campaign owner/Game Masters.
- [ ] Only one active session per campaign.

### Shared campaign information

- [ ] Campaign announcements.
- [ ] Shared campaign notes and handouts.
- [ ] Private Game Master notes.
- [ ] Location, in-world date/time, weather, and current objective.
- [ ] Campaign activity feed.

**Phase 1 exit:** a group can organize a campaign, manage its members, schedule play, and begin a uniquely identified session.

## Phase 2 — Play-screen foundation

### Session lifecycle and presence

- [ ] Live session route and persistent play-screen shell.
- [ ] Waiting room before the Game Master starts play.
- [ ] Join/leave/reconnect presence indicators.
- [ ] Game Master pause, resume, and end-session controls.
- [ ] Session clock, elapsed timer, and optional break timer.
- [ ] Connection-health and stale-state indicators.
- [ ] Realtime state synchronization across browser sessions.
- [ ] Restore the full current session after refresh.

### Modular play-screen layout

- [ ] Resizable/collapsible left notebook panel.
- [ ] Central stage with switchable scene, map, camera, and expanded log modes.
- [ ] Party/initiative rail on the right.
- [ ] Bottom action bar.
- [ ] Slide-over character sheet.
- [ ] Modal/drawer system for spells, inventory, monsters, and actions.
- [ ] Persist each user’s panel sizes and visibility preferences.
- [ ] Focus mode for maps, logs, sheets, or notes.
- [ ] Player layout and Game Master layout derived from shared primitives.

### Session event log

- [ ] Append-only structured event model.
- [ ] Human-readable events for joins, rolls, speech, attacks, spells, damage, healing, conditions, and turn changes.
- [ ] Filter by event type or participant.
- [ ] Mentions for characters, creatures, and the party.
- [ ] Expand the log into the central stage.
- [ ] Game Master corrections represented as new audit events rather than destructive history edits.

**Phase 2 exit:** multiple users can enter a resilient live session, see presence, use the modular screen, and share a persistent event stream.

## Phase 3 — Playable turn and action loop

### Dice and checks

- [ ] Standard polyhedral dice roller.
- [ ] Formula rolls such as `1d20 + 5` and damage pools.
- [ ] Advantage, disadvantage, critical hits, and private Game Master rolls.
- [ ] Character ability checks, saving throws, skills, attacks, and initiative shortcuts.
- [ ] Roll results recorded in the session event log.
- [ ] Optional physical-dice/manual result entry.

### Initiative and turns

- [ ] Start/end encounters within a session.
- [ ] Add party characters, monsters, NPCs, and custom combatants.
- [ ] Initiative rolls, manual ordering, ties, and reorder controls.
- [ ] Active-turn indicator, round counter, and next-turn preview.
- [ ] Game Master advance/rewind/skip controls.
- [ ] Track action, bonus action, movement, object interaction, and reaction availability.
- [ ] Reset action economy correctly at turn boundaries.
- [ ] Delay, ready, dodge, disengage, dash, help, hide, and hold-action flows.

### Proposed actions and Game Master approval

- [ ] Player action composer for attack, magic, item, movement, speech, and custom intent.
- [ ] Soft approval for ordinary actions unless denied by the Game Master.
- [ ] Hard approval for exceptional/custom actions.
- [ ] Reaction prompts with accept/decline and expiration.
- [ ] Game Master queue for pending player actions.
- [ ] Approve, deny, edit, or request clarification.
- [ ] Action resolution creates structured log events.

### Combat state

- [ ] Current/max/temporary HP controls.
- [ ] Damage, healing, and death-saving throws.
- [ ] Conditions with source and optional duration.
- [ ] Concentration tracking and checks.
- [ ] Armor class, speed, senses, and status display in party cards.
- [ ] Hidden/unknown values for creatures where appropriate.
- [ ] Defeated, unconscious, stabilized, dead, and removed states.

**Phase 3 exit:** a party can run a complete theater-of-the-mind combat encounter with turns, rolls, actions, reactions, approvals, HP, and conditions.

## Phase 4 — Complete character system

### Character data

- [ ] Skills and saving-throw proficiencies.
- [ ] Proficiency bonus, initiative, passive senses, and derived modifiers.
- [ ] Hit dice, death saves, exhaustion, inspiration, and conditions.
- [ ] Species/ancestry, class, subclass, background, feats, and feature descriptions.
- [ ] Multiclass support.
- [ ] Languages, senses, movement modes, size, alignment, and appearance.
- [ ] Rich biography, allies, organizations, ideals, bonds, and flaws.
- [ ] Character portraits and token artwork.
- [ ] Level-up history and an audit trail for important changes.

### Guided creation and importing — deferred refinement milestone

- [ ] “Quick manual” creation retained for experienced users.
- [ ] Step-by-step new-character wizard.
- [ ] Rules-aware choices and derived-stat calculation.
- [ ] Save and resume unfinished character creation.
- [ ] Import established characters from a supported interchange format.
- [ ] Import preview, field mapping, validation, warnings, and conflict resolution.
- [ ] Duplicate/copy an existing character.
- [ ] Version imported source data and preserve unmapped fields.

### Character permissions

- [ ] Assign/unassign a character to campaigns.
- [ ] Game Master approval for campaign assignment when enabled.
- [ ] Game Master permission to apply session effects without gaining unrestricted character ownership.
- [ ] Private fields visible only to player and Game Master.
- [ ] Retired/deceased character states and campaign history.

## Phase 5 — Inventory, equipment, spells, and actions

### Inventory and equipment

- [ ] Inventory items with quantity, weight, value, notes, and charges.
- [ ] Currency tracking.
- [ ] Equip/unequip and attunement.
- [ ] Containers and carried-weight calculation.
- [ ] Weapons, armor, tools, consumables, and magic items.
- [ ] Item use, transfer, give, drop, and Game Master grant flows.
- [ ] Equipped weapons automatically populate available attacks.

### Spellcasting

- [ ] Spellbook and known/prepared spells.
- [ ] Spellcasting ability, attack bonus, and save DC.
- [ ] Spell slots, pact slots, cantrips, rituals, and resource recovery.
- [ ] Components, concentration, range, area, duration, and higher-level casting.
- [ ] Cast-spell action flow with target selection and log output.
- [ ] Spell sheet drawer from the play screen.

### Reusable actions

- [ ] Character action library derived from equipment, spells, and features.
- [ ] Attacks require an equipped or available weapon where appropriate.
- [ ] Resource costs and limited-use tracking.
- [ ] Custom player actions.
- [ ] Game Master-created actions granted to specific characters.

## Phase 6 — Notebook and campaign knowledge

- [ ] Multiple notebook pages per user and campaign.
- [ ] Rich text, checklists, tables, links, and embedded references.
- [ ] Freehand drawing and simple shapes.
- [ ] Autosave and offline draft protection.
- [ ] Private, party-shared, and Game Master-shared pages.
- [ ] Pin pages to the live-session screen.
- [ ] Game Master temporary overlays/annotations without destroying player notes.
- [ ] Search, tags, folders, and backlinks.
- [ ] Session-linked notes and automatic session recap links.

## Phase 7 — Maps, scenes, and tokens

### Scene management

- [ ] Upload/create map scenes and reusable backgrounds.
- [ ] Scene library and active-scene switching.
- [ ] Game Master preview versus player-visible scene.
- [ ] Grid size, scale, snapping, measurement, and coordinate system.
- [ ] Scene layers for map, drawings, tokens, effects, and Game Master information.

### Tokens and visibility

- [ ] Character, monster, NPC, object, and marker tokens.
- [ ] Drag movement with Game Master authority.
- [ ] Token ownership and player movement permissions.
- [ ] Selection, multi-select, grouping, locking, and z-order.
- [ ] Fog of war, reveal/hide tools, and line of sight.
- [ ] Auras, ranges, conditions, health bars, labels, and hidden tokens.
- [ ] Game Master camera/viewport broadcast with optional player independence.

### Drawing tools

- [ ] Freehand pen, line, rectangle, circle, polygon, arrow, text, and eraser.
- [ ] Color, opacity, stroke width, fill, undo, and redo.
- [ ] Temporary versus persistent drawings.
- [ ] Distance and area templates for spells and effects.

## Phase 8 — Game Master compendium and encounter tools

- [ ] Monster/NPC library with search and filters.
- [ ] Create, duplicate, edit, and archive custom creatures.
- [ ] Stat blocks, actions, reactions, legendary actions, traits, spells, and loot.
- [ ] Private Game Master values and player-safe revealed summaries.
- [ ] Encounter builder and difficulty estimation.
- [ ] Add creatures to initiative and maps from the compendium.
- [ ] Batch/individual monster HP and condition controls.
- [ ] NPC relationship and location tracking.
- [ ] Reusable encounter templates.

## Phase 9 — Audio and atmosphere

- [ ] Campaign audio library.
- [ ] Music playback with title, artist, album, artwork, progress, and volume.
- [ ] Ambient loops and one-shot sound effects.
- [ ] Game Master synchronized playback controls.
- [ ] Per-user volume and mute controls.
- [ ] Playlists and scene-linked audio.
- [ ] Graceful fallback when synchronized browser playback is blocked.

## Phase 10 — Recaps, exports, and campaign continuity

- [ ] End-session summary workflow.
- [ ] Game Master recap plus player-contributed highlights.
- [ ] Attendance, duration, encounters, rewards, and important event summary.
- [ ] Searchable session timeline and replayable event history.
- [ ] Export character sheets, campaign notes, and session logs.
- [ ] Data import/export and user-owned backup format.
- [ ] Campaign completion and archival experience.

## Cross-cutting engineering checklist

### Security and permissions

- [ ] RLS on every exposed table.
- [ ] Explicit grants for every Data API table/function.
- [ ] Campaign-role checks for all Game Master mutations.
- [ ] No service-role credentials in the browser.
- [ ] Validate every realtime write against authoritative database permissions.
- [ ] Audit sensitive role, ownership, HP, inventory, and session-state changes.
- [ ] Abuse controls for chat, rolls, action submissions, uploads, and invites.

### Realtime and reliability

- [ ] Idempotent commands to prevent double actions after retry.
- [ ] Optimistic UI only where rollback is safe.
- [ ] Conflict handling for simultaneous edits.
- [ ] Presence cleanup after disconnects.
- [ ] Reconnect catch-up from durable state/event sequence numbers.
- [ ] Database indexes for campaign, session, encounter, and event access paths.
- [ ] Load testing for realistic party sizes and long sessions.

### Testing

- [ ] RLS tests for owner, Game Master, player, observer, outsider, and anonymous identities.
- [ ] Unit tests for derived character/combat calculations.
- [ ] Integration tests for session lifecycle and turn transitions.
- [ ] Multi-browser realtime tests.
- [ ] End-to-end happy paths for campaign setup through completed session.
- [ ] Reconnect, duplicate-command, stale-client, and permission-change tests.
- [ ] Accessibility and keyboard-navigation tests.

### UI/UX refinement — continuous, with a dedicated polish pass later

- [ ] Consistent pending, success, error, empty, and disabled states.
- [ ] Toasts for background operations and inline feedback for forms.
- [ ] Confirmation for destructive/irreversible operations.
- [ ] “Copied” feedback for invite codes and share links.
- [ ] Tooltips and explanations for unavailable actions.
- [ ] Keyboard shortcuts and command palette for frequent play actions.
- [ ] Reduced-motion support, focus management, and screen-reader announcements.
- [ ] Responsive companion mode for phones/tablets.
- [ ] Onboarding tours for players and Game Masters.

## Recommended implementation order

1. Campaign operations and session scheduling.
2. Live session lifecycle, presence, modular shell, and event log.
3. Dice, initiative, turns, action economy, approvals, HP, and conditions.
4. Character depth, inventory, equipment, spells, and reusable actions.
5. Notebook and shared campaign knowledge.
6. Maps, tokens, drawing, fog, and Game Master camera.
7. Monster compendium and encounter building.
8. Audio, recaps, export, onboarding, and comprehensive polish.

The first major product milestone is the end of Phase 3: a dependable theater-of-the-mind session that supports a complete combat loop. Maps and the richer “million-and-one features” then enhance a working game instead of being prerequisites for one.
