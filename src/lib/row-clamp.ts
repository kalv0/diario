/**
 * Empaquetado de elementos en filas y recorte a un número máximo, replicando
 * en JS el mismo criterio greedy que usa `flex-wrap`: un elemento pasa a la
 * fila siguiente en cuanto no cabe en lo que queda de la actual.
 *
 * CSS por sí solo no puede limitar un `flex-wrap` a un número de filas cuando
 * el contenido tiene ancho variable (no hay un `line-clamp` para flex), así
 * que el recorte se calcula aquí a partir de anchos medidos en el DOM.
 */

export interface RowClampItem {
  key: string;
}

export function packRows<T extends RowClampItem>(
  items: T[],
  widths: Map<string, number>,
  containerWidth: number,
  gap: number,
): T[][] {
  const rows: T[][] = [];
  let row: T[] = [];
  let rowWidth = 0;

  for (const item of items) {
    const width = widths.get(item.key) ?? 0;
    const needed = row.length === 0 ? width : rowWidth + gap + width;
    if (row.length === 0 || needed <= containerWidth) {
      row.push(item);
      rowWidth = needed;
    } else {
      rows.push(row);
      row = [item];
      rowWidth = width;
    }
  }
  if (row.length > 0) rows.push(row);
  return rows;
}

export interface ClampResult<T> {
  visible: T[];
  needsToggle: boolean;
}

/**
 * Si todo cabe en `maxRows`, se devuelve tal cual. Si no, las primeras
 * `maxRows - 1` filas se quedan enteras y en la última se hace hueco para el
 * botón «Ver más» (`moreWidth`), quitando elementos del final si hiciera
 * falta para que quepa sin desbordar.
 */
export function clampToRows<T extends RowClampItem>(
  items: T[],
  widths: Map<string, number>,
  containerWidth: number,
  gap: number,
  moreWidth: number,
  maxRows: number,
): ClampResult<T> {
  if (containerWidth === 0 || widths.size === 0) return { visible: items, needsToggle: false };

  const rows = packRows(items, widths, containerWidth, gap);
  if (rows.length <= maxRows) return { visible: items, needsToggle: false };

  const firstRows = rows.slice(0, maxRows - 1);
  const firstCount = firstRows.reduce((sum, r) => sum + r.length, 0);
  const lastRow = rows[maxRows - 1];

  const widthWithK = (k: number): number => {
    if (k === 0) return moreWidth;
    let width = gap + moreWidth;
    for (let i = 0; i < k; i++) {
      width += (widths.get(lastRow[i].key) ?? 0) + (i > 0 ? gap : 0);
    }
    return width;
  };

  let k = lastRow.length;
  while (k > 0 && widthWithK(k) > containerWidth) k -= 1;

  return { visible: items.slice(0, firstCount + k), needsToggle: true };
}
