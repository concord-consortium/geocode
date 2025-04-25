import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { round } from "../utilities/widget";
import { Datasets } from "../stores/data-sets";

const StyledTable = styled.table`
  background-color: #DDEDFF;
  color: #434343;
  margin-top: 5px;
  border-spacing: 0;
  width: 430px;
  height: 104px;
  font-size: 16px;
  border: solid 1px #979797;

  thead>tr {
    background-color: white;
  }

  tr.horizontal-spacer {
    height: 2px;
    padding: 0;
    background-color: white;
  }
  td.horizontal-spacer {
    padding: 0;
  }
  td.vertical-spacer {
    padding: 0;
    width: 2px;
    background-color: white;
  }

  th, td {
    padding: 2px 2px 2px 10px;
  }

  td.value {
    text-align: right;
    padding-right: 10px;
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
    if (positionData.data) {
      installed = (positionData.data[0].Date as Date).toLocaleDateString("en-US");
      lastRecord = (positionData.data[positionData.data.length - 1].Date as Date).toLocaleDateString("en-US");
      datesClass = "";
    }

    return (
      <StyledTable>
        <thead>
          <tr>
            <th colSpan={5}>
              GPS Station ID: {station.id}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Latitude</td>
            <td className="value">{round(station.latitude, 5)}</td>
            <td className="vertical-spacer"/>
            <td>Speed (mm/y)</td>
            <td className="value">{round(station.speed, 1)}</td>
          </tr>
          <tr className="horizontal-spacer"><td colSpan={5} className="horizontal-spacer"/></tr>
          <tr>
            <td>Longitude</td>
            <td className="value">{round(station.longitude, 5)}</td>
            <td className="vertical-spacer"/>
            <td>Direction (º from N)</td>
            <td className="value">{Math.round(station.direction)}</td>
          </tr>
          <tr className="horizontal-spacer"><td colSpan={5} className="horizontal-spacer"/></tr>
          <tr>
            <td>Installed</td>
            <td className={`value ${datesClass}`}>{installed}</td>
            <td className="vertical-spacer"/>
            <td>Last Record</td>
            <td className={`value ${datesClass}`}>{lastRecord}</td>
          </tr>
        </tbody>
      </StyledTable>
    );
  }
}
