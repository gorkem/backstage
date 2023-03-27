/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  PluginScannerInterface,
  ScannedPlugin,
  ScannedPluginManifest,
} from '.';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as url from 'url';

export class PluginScanner implements PluginScannerInterface {
  private readonly userPluginsLocation: URL;

  constructor(userPluginsLocation: URL) {
    this.userPluginsLocation = userPluginsLocation;
  }

  async scanUserPlugins(): Promise<ScannedPlugin[]> {
    const pstat = await fs.lstat(this.userPluginsLocation);
    if (!pstat.isDirectory()) {
      return Promise.reject('Not a directory');
    }
    const pluginsDir = await fs.readdir(this.userPluginsLocation, {
      withFileTypes: true,
    });
    if (pluginsDir.length === 0) {
      return [];
    }
    const scannedPlugins: ScannedPlugin[] = [];
    for (const pluginDir of pluginsDir) {
      if (pluginDir.isDirectory()) {
        const pluginHome = path.resolve(
          this.userPluginsLocation.pathname,
          pluginDir.name,
        );
        const manifestFile = path.resolve(pluginHome, 'package.json');
        const content = await fs.readFile(manifestFile);
        const manifest: ScannedPluginManifest = JSON.parse(content.toString());
        scannedPlugins.push({
          location: url.pathToFileURL(pluginHome),
          manifest: manifest,
        });
      }
    }
    return scannedPlugins;
  }
}
