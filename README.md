# Mel's Dress Up Studio | Static Website

A static HTML/CSS/JavaScript rebuild of **Mel's Dress Up Studio**, originally built on
Base44 (https://mel-dress-play.base44.app). The layout, colors, wardrobe, characters,
Shop, Gallery and Dreamland scenes were recreated from the original app's own code. It
needs no server, no database, no accounts and no paid platform, and it works offline
once installed.

- **Pages:** Home (the dress-up studio), Gallery, Shop, Dreamland, plus a 404 page
- **Font:** Nunito, the font the original asked for
- **Hosting:** GitHub Pages or any static host

## Folder structure (22 files, one folder, no subfolders)

```text
mel-dress-up/
├── index.html            Home: pick a friend, dress them up, Start Over, Save My Creation!
├── gallery.html          My Gallery: saved creations, full-screen viewer
├── shop.html             Magical Shop: spend Sparkles (play money only)
├── dreamland.html        Dreamland: four tap-to-play magic scenes
├── 404.html              "Page not found" (also forwards old links like /Home, /Shop)
├── data.js               ALL editable content: characters, wardrobe, shop items, scenes
├── app.js                Shared: icons, stars, storage, install card, Gallery, Shop
├── render.js             Draws the characters and their clothes
├── dress-up.js           The Home page dress-up controls
├── dreamland.js          The Dreamland scenes
├── style.css             All styling (colors are variables at the top)
├── mel.jpg               Mel's 3D picture
├── mel-mask-top.png      Where Mel's shirt is (white = shirt)
├── mel-mask-bottom.png   Where Mel's pants are
├── mel-mask-shoes.png    Where Mel's shoes are
├── favicon.svg           Browser tab icon
├── icon-192.png          App icon (phones/tablets)
├── icon-512.png          App icon (large)
├── manifest.webmanifest  Lets the game be installed like an app
├── sw.js                 Offline support
├── README.md
└── .gitignore
```

The build is one flat folder on purpose: uploading through GitHub's website can drop
folders, and a flat folder can't break that way.

## Step 1: Preview on your computer

1. Right-click the zip → **Extract All** → **Extract** (never open pages from inside the zip).
2. Double-click `index.html`. Everything shows and dressing up works.
3. **Saving pictures only works from a web address** (the live site, or the local server
   below). Opened straight from a file, Save shows a friendly message instead. That's a
   browser safety rule, not a bug.

Full preview, closest to the live site (Python 3.11):

```bash
cd mel-dress-up
python -m http.server 8000
```

Open http://localhost:8000 and press `Ctrl + C` in the terminal to stop.

## Step 2: Put it on GitHub

1. Sign in at https://github.com.
2. Click **+** (top right) → **New repository**.
3. Name it (e.g. `mel-dress-up`), choose **Public**, and leave README, .gitignore and
   license **unchecked**. Click **Create repository**.
4. Click **uploading an existing file**.
5. Open the extracted `mel-dress-up` folder, press **Ctrl+A**, and drag all the files into
   the browser (Chrome or Edge). Drag the files, not the folder.
6. Wait until all 22 files are listed, type `Initial Mel's Dress Up Studio website`, and click
   **Commit changes**.
7. Check the repo's main page: `index.html` must be at the top level, not inside a folder.

Or with Git:

```bash
cd mel-dress-up
git init
git add .
git commit -m "Initial Mel's Dress Up Studio website"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Step 3: Turn on GitHub Pages

1. In the repo, click **Settings** → **Pages**.
2. Set **Source** to **Deploy from a branch**, branch **main**, folder **/ (root)**, and click
   **Save**.
3. Wait 1 to 3 minutes and refresh. The game is live at
   `https://YOUR-ACCOUNT.github.io/mel-dress-up/`.
4. Open it and press **Ctrl+Shift+R** for a fresh load.

## Step 4: Fix link previews (after it's live)

In each of the 5 `.html` files, replace `https://www.example.com/` near the top (4 spots per
page) with the live address. Then shared links show Mel's picture.

## Custom domain (later)

1. **Settings → Pages → Custom domain**: enter the domain and save.
2. At the registrar: a **CNAME** record for `www` pointing to `YOUR-ACCOUNT.github.io`, and
   **A** records for the bare domain pointing to `185.199.108.153`, `185.199.109.153`,
   `185.199.110.153`, `185.199.111.153`.
3. When DNS updates (up to 24 hours), tick **Enforce HTTPS**, then update the preview tags
   (Step 4) to the new domain.

## After ANY change: bump the offline version

The game saves its files on devices so it can be played offline. When you change a file,
open `sw.js` and change `var CACHE = "mel-v1";` to `"mel-v2"` (then v3, v4...). Otherwise
some devices keep showing the old version.

## Updating content (all in data.js)

Open `data.js` on GitHub → **pencil icon** → edit → **Commit changes** → wait 2 minutes →
bump `sw.js` (above) → open the site and hard refresh.

### Add a clothing item

Find the character (e.g. `girl: {`), then the tab (`tops`, `bottoms`, `accessories`,
`shoes`), and add a line:

```javascript
        { id: "g-top-13", name: "Sky Stars", color: "#7DD3FC", slot: "top" },
```

- `id` must be unique. `slot` is `top`, `bottom`, `accessory` or `shoes`.
- Keep the comma after `}` except on the last line of a list.
- Words in the name change the drawing on the illustrated friends: tops with **dress**,
  **gown** or **ball** become dresses; **coat**, **hoodie**, **sweater** get long sleeves;
  **heart**, **star**, **sun**, **leaf**, **sparkle**, **stripes**, **spots**, **rainbow** add
  prints. Bottoms with **skirt** or **tutu** become skirts, **shorts** become shorts. Shoes with
  **boots**, **heels**, **sneakers**, **hooves**, **paws**, **rocket**, **wheel** change shape.
  Accessories are recognized by names like **crown**, **tiara**, **bow**, **hat**,
  **sunglasses**, **necklace**, **scarf**, **earrings**, **wand**, **wings** and more.

### Change the Shop

Edit the `shop` list: name, price, emoji and `locked: true` for "Coming Soon". Starting
Sparkles are `startingSparkles`; Sparkles earned per saved creation are `sparklesPerSave`.

### Make another friend 3D (like Mel)

Right now only Mel uses a 3D picture; the other seven are illustrated so every outfit works.
To upgrade a friend:

1. Make one picture in the same style as Mel's: the character alone, standing, arms out,
   plain colored top, pants and shoes, soft pastel background, square (1024 × 1024).
2. Send it to Claude and ask for the clothing masks. Three black-and-white "mask" pictures
   show where the top, bottom and shoes are.
3. Add the picture and masks to the folder, add an entry under `photos` in `data.js`, and
   change that character's `style` to `"photo"`.

## What changed from the Base44 version, and why

| Base44 | This rebuild |
| --- | --- |
| Every clothing tap asked an AI to paint a brand-new picture (with a "Creating Mel…" wait). That needs a server and a private AI key, which a public static site can't have. | Mel's own 3D picture is recolored instantly with her shading kept. The other friends are illustrated and change instantly. Works offline, no waiting, same wardrobe. |
| Clothing shape could change (a skirt drew a skirt) | On Mel's 3D picture only the colors change, so a "skirt" shows as her pants in that color. The illustrated friends do change shape. |
| Save downloaded the AI picture but never added it to the Gallery, so the Gallery was always empty | Save downloads a PNG **and** adds it to My Gallery on this device |
| Sparkles reset to 500 on every visit; "earn more sparkles" wasn't possible | Sparkles and purchases are remembered on the device, and each saved creation earns 10 |
| Fairy Wand showed as an empty box on Windows (emoji not supported) | Drawn as an icon so it shows everywhere |
| "Install Now" card showed even when installing wasn't possible | Shows only when the device can install the game; "×" hides it for good |
| Home title partly hidden behind the menu; character stage pushed to one side | Spacing fixed; stage centered |
| Light-colored wardrobe tiles had white names that were hard to read | Each tile picks the easier-to-read text color |
| Folders `css/`, `js/`, `images/` | One flat folder (upload-proof) |

## Privacy and safety

- No accounts, no sign-up, no ads, no tracking, no analytics.
- Nothing leaves the device: saved creations, Sparkles and the current outfit live only in
  that browser (`localStorage`). Clearing browser data removes them.
- The Shop uses play money only. There's no payment code and nothing asks for personal
  information.
- No passwords, keys or tokens anywhere in the project.

## Checked before delivery

- All 5 pages load with no script errors, served from a subfolder like GitHub Pages
- No sideways scrolling at 1920, 1440, 1280, 1024, 768, 480 and 375px wide
- Every character, every accessory and every tab tested; picking, un-picking, Start Over,
  and the look remembered after reload
- Save: PNG download plus Gallery entry plus +10 Sparkles; Gallery viewer (arrows, Escape,
  swipe), save and delete; Shop buying, "Not Enough Sparkles", "Coming Soon", remembered
  after reload; all four Dreamland scenes
- Opened as a plain file: everything shows and Save explains itself
