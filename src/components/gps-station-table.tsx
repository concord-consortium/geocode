import * as React from "react";
import styled from "styled-components";
import { observer, inject } from "mobx-react";
import { BaseComponent, IBaseProps } from "./base";
import { round } from "../utilities/widget";

const StyledTable = styled.table`
  background-color: #DDEDFF;
  color: #434343;
  margin-top: 5px;
  margin-left: 28px;
  border-spacing: 0;
  width: 270px;

  thead>tr {
    background-color: white;
  }

  th, td {
    padding: 3px 20px;
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
    const { selectedGPSStation } = this.stores.seismicSimulation;
    if (!selectedGPSStation) return;

    const speedmm = Math.sqrt(selectedGPSStation.eastVelocity ** 2 + selectedGPSStation.northVelocity ** 2) * 1000;

    return (
      <StyledTable>
        <thead>
          <tr>
            <th colSpan={2}>
              GPS Station ID: {selectedGPSStation.id}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Latitude</td>
            <td>{round(selectedGPSStation.latitude, 5)}</td>
          </tr>
          <tr>
            <td>Longitude</td>
            <td>{round(selectedGPSStation.longitude, 5)}</td>
          </tr>
          <tr>
            <td>Speed (mm/y)</td>
            <td>{round(speedmm, 1)}</td>
          </tr>
        </tbody>
      </StyledTable>
    );
  }
}
