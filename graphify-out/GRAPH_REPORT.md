# Graph Report - F:\Sold-projects\kuber-agency  (2026-06-07)

## Corpus Check
- 42 files · ~55,317 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 86 nodes · 71 edges · 29 communities detected
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 10 edges
2. `POST()` - 9 edges
3. `getValidSession()` - 6 edges
4. `PATCH()` - 5 edges
5. `handleExportBackup()` - 3 edges
6. `submitPin()` - 3 edges
7. `getSession()` - 3 edges
8. `ExampleInstrumentedTest` - 2 edges
9. `ExampleUnitTest` - 2 edges
10. `RootPage()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `RootPage()` --calls--> `getValidSession()`  [INFERRED]
  F:\Sold-projects\kuber-agency\app\page.tsx → F:\Sold-projects\kuber-agency\lib\session.ts
- `GET()` --calls--> `getValidSession()`  [INFERRED]
  F:\Sold-projects\kuber-agency\app\api\tasks\route.ts → F:\Sold-projects\kuber-agency\lib\session.ts
- `handleExportBackup()` --calls--> `GET()`  [INFERRED]
  F:\Sold-projects\kuber-agency\app\settings\page.tsx → F:\Sold-projects\kuber-agency\app\api\tasks\route.ts
- `POST()` --calls--> `getSession()`  [INFERRED]
  F:\Sold-projects\kuber-agency\app\api\tasks\route.ts → F:\Sold-projects\kuber-agency\lib\session.ts
- `POST()` --calls--> `getValidSession()`  [INFERRED]
  F:\Sold-projects\kuber-agency\app\api\tasks\route.ts → F:\Sold-projects\kuber-agency\lib\session.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.22
Nodes (2): GET(), POST()

### Community 1 - "Community 1"
Cohesion: 0.38
Nodes (3): checkAndPromptBiometrics(), handleBiometricScan(), submitPin()

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (1): handleExportBackup()

### Community 3 - "Community 3"
Cohesion: 0.4
Nodes (2): DELETE(), PATCH()

### Community 4 - "Community 4"
Cohesion: 0.5
Nodes (3): RootPage(), getSession(), getValidSession()

### Community 5 - "Community 5"
Cohesion: 0.4
Nodes (0): 

### Community 6 - "Community 6"
Cohesion: 0.4
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (1): ExampleInstrumentedTest

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (1): ExampleUnitTest

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (1): MainActivity

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **1 isolated node(s):** `MainActivity`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 13`** (2 nodes): `MainActivity.java`, `MainActivity`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `page.tsx`, `saveLogo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `seed.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `hash-pin.js`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `capacitor.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `cordova.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `cordova_plugins.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `route.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `HistoryPopup.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `uploadthing.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `prisma.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `uploadthing.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 0` to `Community 2`, `Community 3`, `Community 4`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `handleExportBackup()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getValidSession()` connect `Community 4` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `GET()` (e.g. with `getValidSession()` and `handleExportBackup()`) actually correct?**
  _`GET()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `POST()` (e.g. with `getSession()` and `getValidSession()`) actually correct?**
  _`POST()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `getValidSession()` (e.g. with `RootPage()` and `POST()`) actually correct?**
  _`getValidSession()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `MainActivity` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._