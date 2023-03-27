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
import { Config } from '@backstage/config';
import { LocalPlugin, PluginManagerInterface } from '.';
import { PluginScanner } from '../scanner/plugin-scanner';
import * as url from 'url';
import { ScannedPlugin } from '../scanner';

export class PluginManager implements PluginManagerInterface {
  static fromConfig(config: Config): PluginManager {
    return new PluginManager(config);
  }

  private readonly config: Config;
  private readonly scanner: PluginScanner;

  constructor(config: Config) {
    this.config = config;
    this.scanner = new PluginScanner(
      url.pathToFileURL(
        '/Users/gercan/workspaces/janus/backstage-plugins/plugins',
      ),
    );
    this.scanner.scanUserPlugins().then(plugins => {
      for (const plugin of plugins) {
        this.loadPlugin(plugin);
      }
    });
  }

  installFromLocation(_location: string): Promise<LocalPlugin> {
    throw new Error('Method not implemented.');
  }

  private loadPlugin(plugin: ScannedPlugin) {
    import(url.fileURLToPath(plugin.location))
      .then(() => {
        console.log(`loaded ${plugin.location}`);
      })
      .catch(error => {
        console.log(error);
      });
  }
}
