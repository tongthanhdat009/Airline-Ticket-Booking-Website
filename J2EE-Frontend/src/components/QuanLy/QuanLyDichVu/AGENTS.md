<!-- Parent: ../../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# QuanLyDichVu

## Purpose
Admin widgets for dịch vụ (ancillary services): the service card in the grid view, the create/edit modal for a service, the detail modal that manages its lựa chọn (options), and the option create/edit/delete modals.

## Key Files
| File | Description |
|------|-------------|
| `DichVuCard.jsx` | Memoized card showing the dịch vụ name, description, price and image with `onView` / `onEdit` / `onDelete` actions. |
| `ServiceModal.jsx` | Create/edit form for a dịch vụ (`tenDichVu`, `moTa`, `anh`) with an image file picker and preview via `getServiceImageUrl`. |
| `ServiceDetailModal.jsx` | Service detail with a paginated option list (3 per page) and add / edit / delete buttons that open the option modals. |
| `CreateOptionModal.jsx` | Creates a lựa chọn (`tenLuaChon`, `moTa`, `gia`) with an image picker. |
| `EditOptionModal.jsx` | Edits an existing lựa chọn, pre-loading the image preview from `getServiceOptionImageUrl`. |
| `DeleteConfirmationModal.jsx` | Confirmation before deleting a dịch vụ; states that the action cannot be undone. |

## For AI Agents

### Working In This Directory
- The modals are controlled: the page passes the entity and the save handler (`onSave`, `onCreateOption`, `onEditOption`, `onDeleteOption`); the modals own only the form state.
- Image handling is upload-and-preview: the file is held locally in `selectedImage` / `imagePreview` and submitted through `onSave`.
- `ServiceDetailModal` paginates client-side with `itemsPerPage = 3`; changing the page size affects only that constant.

### Testing Requirements
- `pnpm lint` must pass; there are no unit tests. Create a dịch vụ with an option and an image in `pnpm dev` against the backend on port 8080.

### Common Patterns
- Service images use `getServiceImageUrl` and option images use `getServiceOptionImageUrl` — different endpoints in `config/api.config.js`, do not mix them.
- `CreateOptionModal` and `EditOptionModal` are near-identical; keep their field names (`tenLuaChon`, `moTa`, `gia`) aligned with the backend.
- `ServiceDetailModal` composes the two option modals internally rather than rendering them at page level.

## Dependencies

### Internal
- `../../../config/api.config.js` - `getServiceImageUrl`, `getServiceOptionImageUrl`.
- `../../../services/QLDichVuService.jsx` - CRUD for dịch vụ and lựa chọn.
- `../../../pages/QuanLy/QuanLyDichVu.jsx` - the page that owns the service list and mutations.

### External
- react-icons - service and trash icons.
- prop-types - runtime prop validation on `DichVuCard`.

<!-- MANUAL: -->
