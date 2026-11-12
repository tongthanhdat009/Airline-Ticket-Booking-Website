<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# dto/menu

## Purpose
Payloads for the admin panel's dynamic menu: menu items, groups, the action catalog and the resolved configuration for the current user.

## Key Files
| File | Description |
|------|-------------|
| `MenuItemDTO.java` | One admin menu entry: `maChucNang`, `maCode`, name, group, `routePath`, icon/colour classes, `displayOrder`, `permissionKey`. |
| `MenuGroupDTO.java` | A menu group ("Vận hành", "Bán vé", …) with its items, colour and icon. |
| `ActionDTO.java` | Action catalog entry: `code`, `label`, `description` with a Vietnamese label fallback per code. |
| `MenuConfigResponse.java` | Everything the admin frontend needs: items, actions, the caller's `userPermissions` and groups. |

## For AI Agents

### Working In This Directory
- `permissionKey` (`FEATURE_ACTION`) is what the frontend checks before rendering an item; it must match the `@RequirePermission` values in the controllers.
- `routePath` is a frontend route name, not a URL — changing it breaks the admin SPA navigation.
- `uiIcon` and `uiColor` are icon/component class strings rendered by the frontend as-is.

### Testing Requirements
- A permission change must keep `MenuService` output in sync with the controller annotations; assert the menu is filtered by the caller's permissions.
- Verify a role without permissions receives an empty item list.

### Common Patterns
- Menu data comes from the `chuc_nang` table seeded by Flyway, not from Java constants.
- `MenuConfigResponse` is the single payload the admin app fetches on login.

## Dependencies

### Internal
- `../../service/MenuService.java` - resolves items and groups for the current user.
- `../../model/ChucNang.java` - menu rows with route/icon metadata.

### External
- Jackson - JSON serialization of the menu payload to the admin frontend.

<!-- MANUAL: -->
