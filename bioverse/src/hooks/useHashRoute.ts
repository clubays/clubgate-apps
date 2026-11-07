/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLocation } from 'react-router-dom';

export function useHashRoute(): string {
  const location = useLocation();
  return location.pathname;
}
