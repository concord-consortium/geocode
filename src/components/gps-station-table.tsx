import * as React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { round } from "../utilities/widget";
import RawPositionTimeData from "../assets/data/seismic/position-time-data";
import { Datasets } from "../stores/data-sets";

const StyledTable = styled.table`
  background-color: #DDEDFF;
  color: #434343;
  margin-top: 5px;
  border-spacing: 0;
  width: 430px;

  thead>tr {
    background-color: white;
  }

  th, td {
    padding: 2px 12px;
  }

  td.label {
    font-weight: bold;
  }

  td.na {
    font-style: italic;
  }

  thead tr th:first-child,
  tbody tr td:first-child {
    width: 100px;
    min-width: 100px;
  }
`;

interface IState {}
interface IProps extends IBaseProps {}

@inject("stores")
@observer
export class GPSStationTable extends BaseComponent<IProps, IState> {

  public render() {
    const { selectedGPSStation: station } = this.stores.seismicSimulation;
    if (!station) return;

    let installed = "N/A";
    let lastRecord = "N/A";
    let datesClass = "na";
    const positionData = Datasets.getGPSPositionTimeData(station.id);
    if (positionData) {
      installed = (positionData[0].Date as Date).toLocaleDateString("en-US");
      lastRecord = (positionData[positionData.length - 1].Date as Date).toLocaleDateString("en-US");
      datesClass = "";
    }

    return (
      <StyledTable>
        <thead>
          <tr>
            <th colSpan={4}>
              GPS Station ID: {station.id}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="label">Latitude</td>
            <td>{round(station.latitude, 5)}</td>
            <td className="label">Speed (mm/y)</td>
            <td>{round(station.speed, 1)}</td>
          </tr>
          <tr>
            <td className="label">Longitude</td>
            <td>{round(station.longitude, 5)}</td>
            <td rowSpan={2} className="label">Direction<br/>{"\u00A0\u00A0"}(º from 0)</td>
            <td>{Math.round(station.direction)}</td>
          </tr>
          <tr>
            <td className="label">Installed</td>
            <td className={datesClass}>{installed}</td>
          </tr>
          <tr>
            <td className="label">Last Record</td>
            <td className={datesClass}>{lastRecord}</td>
          </tr>
        </tbody>
      </StyledTable>
    );
  }
}
