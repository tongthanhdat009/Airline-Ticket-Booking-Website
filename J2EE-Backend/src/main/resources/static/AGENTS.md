<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-10-18 | Updated: 2026-10-22 -->

# static

## Purpose
Bundled seed images for the dịch vụ cung cấp catalogue. Served from the classpath under `/static/...`; admin uploads replace them at runtime under `J2EE-Backend/uploads/`.

## Key Files
| File | Description |
|------|-------------|
| `AnhDichVuCungCap/1.svg` – `5.svg` | Icons for `dichvucungcap` rows 1–5: Hành lý ký gửi, Suất ăn trên máy bay, Bảo hiểm du lịch, Trẻ em bay một mình, Mang theo thú cưng. |
| `AnhLuaChonDichVu/1.jpg` – `8.jpg` | Photos for `luachondichvu` rows 1–8 (gói hành lý 20kg/30kg, combo cơm, Red Bull, rượu vang đỏ, bảo hiểm du lịch, trẻ em bay một mình, thú cưng dưới 7kg). |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `AnhDichVuCungCap/` | 5 SVG icons, one per dịch vụ cung cấp. |
| `AnhLuaChonDichVu/` | 8 JPG photos, one per lựa chọn dịch vụ. |

## For AI Agents

### Working In This Directory
- Filenames are referenced by the DB columns `dichvucungcap.anh` and `luachondichvu.anh` (seeded as `1.svg`..`5.svg` / `1.jpg`..`8.jpg` in `V2__Initial_Data.sql`) — renaming a file breaks the image lookup.
- `DichVuCungCapController` loads them as `new ClassPathResource("static/AnhDichVuCungCap/" + filename)`; the `static/` prefix is part of the lookup path.
- Add a new icon as a new numbered file plus a matching seed row; do not renumber existing ones.

### Testing Requirements
- No automated test covers these assets — after editing or adding an image, load a dịch vụ cung cấp row in the admin UI and confirm the image renders.
- `./mvnw test` from `J2EE-Backend/` does not touch this directory.

### Common Patterns
- SVG for the dịch vụ cung cấp icons (small, colourable), JPG for the lựa chọn dịch vụ photos.
- Uploads go to `J2EE-Backend/uploads/AnhDichVuCungCap/` and `J2EE-Backend/uploads/AnhLuaChonDichVu/` (`file.upload-dir`, default `uploads`); the frontend reads `/uploads/<subdir>/`, so the two trees must keep identical names.

## Dependencies

### Internal
- `src/main/java/com/example/j2ee/controller/DichVuCungCapController.java` - reads the classpath copies.
- `src/main/java/com/example/j2ee/service/DichVuCungCapService.java` - writes uploads into the parallel `uploads/` tree.

### External
- Spring Boot static resource handling - serves `/static/**`; the frontend calls these via `/uploads/**`.

<!-- MANUAL: -->
