import React from "react";
import DataNavigation from "../../src/components/data/DataNavigation";
import { dataRootsResp } from "./DataMocks";
import { mockAxios } from "../axiosMock";

export const DataNavigationTest = () => {
    mockAxios.onGet(/\/api\/filesystem\/root.*/).reply(200, dataRootsResp);
    return (
        <DataNavigation
            path="/iplant/home/ipcdev/analyses/foo/barborkborkborkbarborkborkbork"
            baseId="navigation"
            handlePathChange={console.log}
        />
    );
};

export default { title: "Data" };
