import {FileSystemAdapter, Notice, Plugin, TFile, TFolder} from "obsidian";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AdmZip from "adm-zip";
import {join} from "path";
import {rm} from "fs/promises";
import { existsSync } from "fs";


export default class ObsidianArchive extends Plugin {

	async onload() {
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (file instanceof TFolder)
					menu.addItem((item) => {
						item
							.setIcon("box-glyph")
							.setTitle("Archive folder")
							.onClick(async () => {
								const absPath = join((app.vault.adapter as FileSystemAdapter).getBasePath(), file.path);
								const zipPath = `${absPath}.zip`;
								if (existsSync(zipPath)) {
									new Notice(`Zip-file ${zipPath} already exists`);
									return;
								}
								const zip = new AdmZip();
								await zip.addLocalFolderPromise(absPath, {
									filter: undefined,
									zipPath: undefined
								});
								await zip.writeZipPromise(`${absPath}.zip`);
								await rm(absPath, {recursive: true, force: true});
							});
					});
				else if ((file as TFile).extension == "zip")
					menu.addItem((item) => {
						item
							.setIcon("box-glyph")
							.setTitle("Unarchive folder")
							.onClick(async () => {
								const absPath = join((app.vault.adapter as FileSystemAdapter).getBasePath(), file.path.replace(".zip", ""));
								const zipPath = `${absPath}.zip`;
								const zip = new AdmZip(zipPath);
								await zip.extractAllToAsync(absPath);
								await rm(zipPath);
							});
					});
			}));
	}
}
