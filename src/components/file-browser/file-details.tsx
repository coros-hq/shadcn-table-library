import type { FileEntry, FolderEntry } from './data'
import { FileIcon } from './file-icon'
import { details } from './files'

/** The expanded row: everything known about one file */
export function FileDetails({
  file,
  path,
}: {
  file: FileEntry
  path: FolderEntry[]
}) {
  return (
    <div className="flex flex-col gap-4 py-2 pl-1 sm:flex-row">
      <div
        aria-hidden
        className="flex size-20 shrink-0 items-center justify-center rounded-md border bg-muted/50"
      >
        <FileIcon entry={file} className="size-8" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr_auto_1fr]">
          {details(file, path).map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
        {file.tags.length ? (
          <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
            {file.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
