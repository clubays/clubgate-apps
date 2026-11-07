/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
