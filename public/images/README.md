# Photography

Drop image files into this folder using the exact filenames below. Nothing else
needs changing: the site loads the local file if it is here, and falls back to a
remote placeholder if it is not, so you can add them one at a time.

After adding a file, update its `alt` text in `src/data/media.ts` so the
description matches the photograph you actually used.

## Files

| Filename | Used on | What it should show |
| --- | --- | --- |
| `hero-workshop.jpg` | Home hero | The headline shot. A working manufacturing unit: machinery, stacked stock, roof lights. Portrait or square crops best. |
| `pallet-stack.jpg` | Home, the problem | Pallets or stacked material waiting in a loading bay. Portrait crop. |
| `fabrication.jpg` | Home founding band, About | Someone working at a bench in a metal workshop. Square crop. |
| `timber-yard.jpg` | Materials, timber | Sawn timber boards stacked and banded. |
| `metal-stock.jpg` | Materials, metals | Sheet metal and steel sections racked in a workshop. |
| `plastics-stock.jpg` | Materials, plastics | Moulded plastic parts or sheet stock beside a line. |
| `textiles.jpg` | Materials, textiles | Rolls of fabric on shelving in a production unit. |
| `packaging.jpg` | Materials, packaging | Flattened cardboard or transit packaging, baled or stacked. |
| `manufacturing-surplus.jpg` | Materials, surplus | Offcuts and part-used material collected at the end of a line. |
| `warehouse-aisle.jpg` | Materials (other), For Businesses hero | Palletised stock racked in a warehouse. Wide crop. |
| `production-line.jpg` | How It Works hero | An operator checking parts along a production line. Wide crop. |
| `joinery.jpg` | For Businesses, surplus path | A joiner cutting board material in a woodworking workshop. |

## Practical notes

- **Format:** JPG. Keep each file under roughly 400KB so pages stay quick.
  Around 1600px on the long edge is plenty; the hero can be 2000px.
- **Cropping:** the site crops to fit, and the focus sits in the middle of the
  frame, so avoid shots where the subject is right at an edge.
- **Licensing:** make sure you have the right to use the image commercially.
  Unsplash and Pexels both allow commercial use for free and are the easiest
  places to start. Welsh photography is better than generic stock where you can
  get it, and photographs of real Welsh sites would be better still.
- **People:** avoid shots that look like posed corporate stock, and avoid
  AI-generated people.

## Filenames are the only contract

If you would rather use different names, change the `file` value for that entry
in `src/data/media.ts`.
