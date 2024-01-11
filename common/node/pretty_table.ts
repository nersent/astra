import { dirname } from "path";

import { Workbook } from "exceljs"; // , Color as ExcelColor

import { ensureDir } from "./fs";

export type PrettyTableColor = "black" | "white" | "red" | "lime" | "yellow";

export type PrettyTableForegroundColor = PrettyTableColor;
export type PrettyTableBackgroundColor = PrettyTableColor;

export class PrettyTableCell {
  private _text = "";

  private _foregroundColor: PrettyTableForegroundColor | undefined;

  private _backgroundColor: PrettyTableBackgroundColor | undefined;

  private _bold = false;

  public getText(): string {
    return this._text;
  }

  public text(value: string): PrettyTableCell {
    this._text = value;
    return this;
  }

  public foregroundColor(value: PrettyTableForegroundColor): PrettyTableCell {
    this._foregroundColor = value;
    return this;
  }

  public backgroundColor(value: PrettyTableBackgroundColor): PrettyTableCell {
    this._backgroundColor = value;
    return this;
  }

  public getForegroundColor(): PrettyTableForegroundColor | undefined {
    return this._foregroundColor;
  }

  public getBackgroundColor(): PrettyTableBackgroundColor | undefined {
    return this._backgroundColor;
  }

  public bold(value = true): PrettyTableCell {
    this._bold = value;
    return this;
  }

  public isBold(): boolean {
    return this._bold;
  }
}

export type PrettyTableRow = PrettyTableCell[];

const getExcelCoord = (column: number, row: number): string => {
  return String.fromCharCode(65 + column) + (row + 1);
};

const colorToExcelArgb = (color: PrettyTableColor): string => {
  switch (color) {
    case "red":
      return "FFFF0000";
    case "black":
      return "FF000000";
    case "lime":
      return "FF00FF00";
    case "yellow":
      return "FFFFFF00";
    case "white":
      return "FFFFFFFF";
    default:
      throw new Error(`Unknown color: ${color}`);
  }
};

// const colorToExcelColor = (color: PrettyTableColor): ExcelColor => {
//   return { argb: colorToExcelArgb(color), theme: 0 };
// };

export class PrettyTable {
  public rows: PrettyTableRow[] = [];

  public addRow(row: PrettyTableRow): PrettyTable {
    this.rows.push(row);
    return this;
  }

  public cell(): PrettyTableCell {
    return new PrettyTableCell();
  }

  public async toExcel(path: string): Promise<void> {
    await ensureDir(dirname(path));
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Results");

    for (let rowIndex = 0; rowIndex < this.rows.length; rowIndex++) {
      const row = this.rows[rowIndex];

      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const cell = row[columnIndex];
        if (cell == null) continue;
        const excelCell = worksheet.getCell(
          getExcelCoord(columnIndex, rowIndex),
        );
        excelCell.value = cell.getText();

        if (cell.getForegroundColor()) {
          excelCell.font = {
            color: {
              argb: colorToExcelArgb(cell.getForegroundColor()!),
            },
          };
        }
        if (cell.getBackgroundColor()) {
          excelCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {
              argb: colorToExcelArgb(cell.getBackgroundColor()!),
            },
          };
        }
        if (cell.isBold()) {
          excelCell.font = {
            ...excelCell.font,
            bold: true,
          };
        }
      }
    }

    worksheet.columns.forEach((column) => {
      column.width = 64;
    });

    await workbook.xlsx.writeFile(path);
  }
}
