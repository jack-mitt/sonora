/**
 * @author sriram
 *
 * A component that displays Roots folders and breadcrumbs for Data navigation.
 * On smaller screens, breadcrumbs are replaced by dropdown menu of folder paths.
 *
 */

import React, { useEffect, useState } from "react";
import {
    announce,
    AnnouncerConstants,
    build,
    formatMessage,
    withI18N,
} from "@cyverse-de/ui-lib";
import intlData from "./messages";
import {
    Breadcrumbs,
    Button,
    Hidden,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    Tooltip,
    Typography,
} from "@material-ui/core";
import HomeIcon from "@material-ui/icons/Home";
import FolderSharedIcon from "@material-ui/icons/FolderShared";
import GroupIcon from "@material-ui/icons/Group";
import DeleteIcon from "@material-ui/icons/Delete";
import { makeStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowRightIcon from "@material-ui/icons/ArrowRight";
import FolderIcon from "@material-ui/icons/Folder";
import ids from "./ids";
import constants from "../../constants";
import { getFilesystemRoots } from "../../serviceFacades/filesystem";
import { useUserProfile } from "../../contexts/userProfile";
import { queryCache, useQuery } from "react-query";

const useStyles = makeStyles((theme) => ({
    selectedListItem: {
        paddingLeft: 0,
        color: theme.palette.primary.main,
    },
    list: {
        outline: "none",
        cursor: "pointer",
        color: theme.palette.primary.main,
        "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
        },
    },
    currentLocationLink: {
        [theme.breakpoints.down("sm")]: {
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: 70,
        },
    },
}));

/**
 * Splits a path into an array of path items.
 * @example
 * // returns [analyses,wordcount,logs]
 * getPathItems("/analyses/wordcount/logs");
 * @param {string }relativePath - relative path to CyVerse Data Store e.g: /analyses/wordcount/logs
 * @returns {string[]} - path items as a string array  e.g: [analyses,wordcount,logs]
 */
function getPathItems(relativePath) {
    let pathItems = [];
    pathItems = relativePath.split(constants.PATH_SEPARATOR).slice(1);
    return pathItems;
}

/**
 * Computes the path for routing.
 *  * @example
 * // returns "/iplant/home/ipctest/analyses"
 * getPathItems("/iplant/home/ipctest","/analyses/wordcount/logs", 0);
 * @param {string } root - CyVerse Data Store root path e.g: /iplant/home/ipctest
 * @param {string} relativePath - relative path to CyVerse Data Store e.g: /analyses/wordcount/logs
 * @param {number} selectedPathItemIndex - index of the selected path item
 * @returns {string} - path to be used by the nextjs router
 */
function pathToRoute(root, relativePath, selectedPathItemIndex) {
    const relativePathItems = getPathItems(relativePath);
    const reducer = (accumulator, currentVal, idx) => {
        if (idx <= selectedPathItemIndex) {
            return accumulator + constants.PATH_SEPARATOR + currentVal;
        }
        return accumulator;
    };
    const routerPath = relativePathItems.reduce(reducer);
    return `${root}${constants.PATH_SEPARATOR}${routerPath}`;
}

/**
 * Get relative path to CyVerse Data Store path.
 * Note: - Swapping community data path check and shared with me path check will result in incorrect
 * relative path since their path overlaps
 * COMMUNITY_DATA_PATH: "/iplant/home/shared",
 * SHARED_WITH_ME_PATH: "/iplant/home",
 *  * @example
 * // returns "/analyses/wordcount/logs"
 * getRelativePath("/iplant/home/ipctest/analyses/wordcount/logs","/iplant/home/ipctest",
 * "/iplant/trash/home/de-irods/ipctest");
 * @param {string} path -  CyVerse Data Store path
 * @param {string} userHomePath - Users home folder path
 * @param {string} userTrashPath - Users trash folder path
 * @param {string} sharedWithMePath - Data stores shared with me path
 * @param {string}  communityDataPath - Data stores community data path
 * @returns {string} relativePath - relative path to CyVerse Data Store e.g: /analyses/wordcount/logs
 */
function getRelativePath(
    path,
    userHomePath,
    userTrashPath,
    sharedWithMePath,
    communityDataPath
) {
    let relativePath = "";
    if (path.startsWith(userHomePath)) {
        relativePath = path.replace(userHomePath, "");
    } else if (path.startsWith(userTrashPath)) {
        relativePath = path.replace(userTrashPath, "");
    } else if (path.startsWith(communityDataPath)) {
        relativePath = path.replace(communityDataPath, "");
    } else if (path.startsWith(sharedWithMePath)) {
        relativePath = path.replace(sharedWithMePath, "");
    }
    return relativePath;
}

function FolderSelectorMenu({
    root,
    path,
    handlePathChange,
    userHomePath,
    userTrashPath,
    sharedWithMePath,
    communityDataPath,
    baseId,
    intl,
}) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const relativePath = getRelativePath(
        path,
        userHomePath,
        userTrashPath,
        sharedWithMePath,
        communityDataPath
    );
    const pathItems = getPathItems(relativePath);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setSelectedIndex(pathItems.length > 0 ? pathItems.length - 1 : 0);
    }, [pathItems]);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setSelectedIndex(index);
        setAnchorEl(null);
        const relativePath = getRelativePath(
            path,
            userHomePath,
            userTrashPath,
            sharedWithMePath,
            communityDataPath
        );
        handlePathChange(pathToRoute(root, relativePath, index));
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        pathItems.length > 0 && (
            <>
                <List
                    component="nav"
                    aria-controls={formatMessage(
                        intl,
                        "selectedFolderAriaControl"
                    )}
                    aria-label={formatMessage(intl, "selectedFolderAriaLabel")}
                    id={build(baseId, ids.PATH_ITEMS)}
                >
                    <ListItem
                        button
                        aria-haspopup="true"
                        aria-controls={formatMessage(
                            intl,
                            "selectedFolderAriaMenuItemControl"
                        )}
                        aria-label={pathItems[selectedIndex]}
                        onClick={handleClickListItem}
                        className={classes.selectedListItem}
                    >
                        {
                            <>
                                <ArrowRightIcon /> <FolderIcon />
                            </>
                        }
                        <ListItemText
                            id={build(
                                baseId,
                                ids.PATH_ITEMS,
                                ids.SELECTED_PATH_ITEM
                            )}
                            primary={
                                <Typography
                                    className={classes.currentLocationLink}
                                >
                                    {pathItems[selectedIndex]}
                                </Typography>
                            }
                        />
                        <ListItemIcon>
                            <ArrowDropDownIcon />
                        </ListItemIcon>
                    </ListItem>
                </List>

                <Menu
                    id={build(baseId, ids.PATH_ITEMS_MENU)}
                    aria-haspopup="true"
                    aria-controls={formatMessage(
                        intl,
                        "FolderPathsMenuAriaControl"
                    )}
                    aria-label={formatMessage(intl, "FolderPathsMenuAriaLabel")}
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    {pathItems.map((crumb, index) => (
                        <ListItem
                            id={build(
                                baseId,
                                ids.PATH_ITEMS_MENU,
                                ids.PATH_ITEMS_MENU_ITEM
                            )}
                            aria-label={pathItems[selectedIndex]}
                            key={crumb}
                            selected={index === selectedIndex}
                            onClick={(event) =>
                                handleMenuItemClick(event, index)
                            }
                            className={classes.list}
                        >
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText>{crumb}</ListItemText>
                        </ListItem>
                    ))}
                </Menu>
            </>
        )
    );
}

function BreadCrumb({
    root,
    path,
    handlePathChange,
    userHomePath,
    userTrashPath,
    sharedWithMePath,
    communityDataPath,
    baseId,
    intl,
}) {
    const classes = useStyles();
    const relativePath = getRelativePath(
        path,
        userHomePath,
        userTrashPath,
        sharedWithMePath,
        communityDataPath
    );

    const handleClick = (event, relativePath, crumb) => {
        event.preventDefault();
        const relativePathItems = getPathItems(relativePath);
        const index = relativePathItems.indexOf(crumb);
        handlePathChange(pathToRoute(root, relativePath, index));
    };

    return (
        <>
            {relativePath && <ArrowRightIcon color="primary" />}
            <Breadcrumbs
                maxItems={2}
                aria-label="breadcrumb"
                id={build(baseId, ids.BREADCRUMBS)}
                aria-controls={formatMessage(
                    intl,
                    "dataNavigationBreadcrumbsControl"
                )}
            >
                {getPathItems(relativePath).map((crumb) => (
                    <Tooltip title={crumb} key={crumb}>
                        <Button
                            variant="text"
                            startIcon={<FolderIcon color="primary" />}
                            aria-controls={formatMessage(
                                intl,
                                "folderPathAriaControl"
                            )}
                            id={build(
                                baseId,
                                ids.BREADCRUMBS,
                                ids.PATH_ITEM,
                                crumb
                            )}
                            key={crumb}
                            color="inherit"
                            onClick={(event) =>
                                handleClick(event, relativePath, crumb)
                            }
                        >
                            <Typography className={classes.currentLocationLink}>
                                {crumb}
                            </Typography>
                        </Button>
                    </Tooltip>
                ))}
            </Breadcrumbs>
        </>
    );
}

function DataNavigation(props) {
    const { path, handlePathChange, baseId, intl } = props;
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dataRoots, setDataRoots] = useState([]);
    const [userHomePath, setUserHomePath] = useState("");
    const [userTrashPath, setUserTrashPath] = useState("");
    const [sharedWithMePath, setSharedWithMePath] = useState("");
    const [communityDataPath, setCommunityDataPath] = useState("");
    const dataNavId = build(baseId, ids.DATA_NAVIGATION);
    const [userProfile] = useUserProfile();

    const preProcessData = (respData) => {
        if (respData && userProfile) {
            const respRoots = respData.roots;
            const home = respRoots.find(
                (root) => root.label === userProfile.id
            );
            home.icon = <HomeIcon />;
            const sharedWithMe = respRoots.find(
                (root) => root.label === constants.SHARED_WITH_ME
            );
            setSharedWithMePath(sharedWithMe.path);
            sharedWithMe.icon = <FolderSharedIcon />;
            const communityData = respRoots.find(
                (root) => root.label === constants.COMMUNITY_DATA
            );
            setCommunityDataPath(communityData.path);
            communityData.icon = <GroupIcon />;
            const trash = respRoots.find(
                (root) => root.label === constants.TRASH
            );
            trash.icon = <DeleteIcon />;

            const basePaths = respData["base-paths"];
            setUserHomePath(basePaths["user_home_path"]);
            setUserTrashPath(basePaths["user_trash_path"]);
            setDataRoots([home, sharedWithMe, communityData, trash]);
        }
    };

    useEffect(() => {
        //route to default path
        if (dataRoots.length > 0 && !path) {
            handlePathChange(dataRoots[0].path);
        }
    }, [dataRoots, handlePathChange, path]);

    const { error } = useQuery({
        queryKey: "dataFileSystemRoots",
        queryFn: getFilesystemRoots,
        config: {
            onSuccess: preProcessData,
            onError: () => {
                //temporary workaround -> should still display community data
                announce({
                    text: formatMessage(intl, "dataSignIn"),
                    variant: AnnouncerConstants.ERROR,
                });
            },
            staleTime: Infinity,
            cacheTime: Infinity,
        },
    });

    useEffect(() => {
        /**
         * Note: - Swapping community data path check and shared with me path check will result in
         * incorrect relative path since their path overlaps
         * COMMUNITY_DATA_PATH: "/iplant/home/shared",
         * SHARED_WITH_ME_PATH: "/iplant/home",
         */
        if (dataRoots.length > 0 && path) {
            if (path.startsWith(userHomePath)) {
                setSelectedIndex(
                    dataRoots.findIndex((root) => root.path === userHomePath)
                );
            } else if (path.startsWith(userTrashPath)) {
                setSelectedIndex(
                    dataRoots.findIndex((root) => root.path === userTrashPath)
                );
            } else if (path.startsWith(communityDataPath)) {
                setSelectedIndex(
                    dataRoots.findIndex(
                        (root) => root.path === communityDataPath
                    )
                );
            } else if (path.startsWith(sharedWithMePath)) {
                setSelectedIndex(
                    dataRoots.findIndex(
                        (root) => root.path === sharedWithMePath
                    )
                );
            }
        }
    }, [
        dataRoots,
        path,
        userHomePath,
        userTrashPath,
        sharedWithMePath,
        communityDataPath,
    ]);

    const handleClickListItem = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuItemClick = (event, index) => {
        setAnchorEl(null);
        handlePathChange(dataRoots[index].path);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (dataRoots.length === 0) {
        const cacheRoots = queryCache.getQueryData("dataFileSystemRoots");
        if (cacheRoots) {
            preProcessData(cacheRoots);
        }
        return null;
    }

    return (
        <>
            <List
                component="nav"
                aria-controls={formatMessage(
                    intl,
                    "selectedDataRootMenuAriaControl"
                )}
                aria-label={formatMessage(
                    intl,
                    "selectedDataRootMenuAriaLabel"
                )}
                id={build(dataNavId, ids.DATA_ROOTS)}
            >
                <ListItem
                    button
                    aria-haspopup="true"
                    aria-controls={formatMessage(
                        intl,
                        "selectedDataRootAriaMenuItemControl"
                    )}
                    aria-label={dataRoots[selectedIndex].label}
                    onClick={handleClickListItem}
                    className={classes.selectedListItem}
                >
                    {dataRoots[selectedIndex].icon}
                    <ListItemText
                        id={build(
                            baseId,
                            ids.DATA_ROOTS,
                            dataRoots[selectedIndex].label
                        )}
                        primary={
                            <Typography className={classes.currentLocationLink}>
                                {dataRoots[selectedIndex].label}
                            </Typography>
                        }
                    />
                    <ListItemIcon style={{ minWidth: 20 }}>
                        <ArrowDropDownIcon />
                    </ListItemIcon>
                </ListItem>
            </List>
            <Menu
                id={build(baseId, ids.DATA_ROOTS_MENU)}
                aria-haspopup="true"
                aria-controls={formatMessage(intl, "dataRootMenuAriaControl")}
                aria-label={formatMessage(intl, "dataRootsMenuAriaLabel")}
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {dataRoots.map((menuItem, index) => (
                    <ListItem
                        id={build(
                            dataNavId,
                            ids.DATA_ROOTS_MENU,
                            ids.DATA_ROOTS_MENU_ITEM,
                            menuItem.label
                        )}
                        aria-controls={formatMessage(
                            intl,
                            "dataRootsMenuItemAriaControl"
                        )}
                        aria-label={menuItem.label}
                        key={menuItem.label}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                        className={classes.list}
                    >
                        <ListItemIcon>{menuItem.icon}</ListItemIcon>
                        <ListItemText>{menuItem.label}</ListItemText>
                    </ListItem>
                ))}
            </Menu>

            <Hidden xsDown>
                {path && (!error || error.length === 0) ? (
                    <BreadCrumb
                        baseId={dataNavId}
                        root={dataRoots[selectedIndex].path}
                        path={path}
                        handlePathChange={handlePathChange}
                        userHomePath={userHomePath}
                        userTrashPath={userTrashPath}
                        sharedWithMePath={sharedWithMePath}
                        communityDataPath={communityDataPath}
                        intl={intl}
                    />
                ) : (
                    <div></div>
                )}
            </Hidden>
            <Hidden only={["sm", "md", "lg", "xl"]}>
                {path && (!error || error.length === 0) ? (
                    <FolderSelectorMenu
                        baseId={dataNavId}
                        root={dataRoots[selectedIndex].path}
                        path={path}
                        handlePathChange={handlePathChange}
                        userHomePath={userHomePath}
                        userTrashPath={userTrashPath}
                        sharedWithMePath={sharedWithMePath}
                        communityDataPath={communityDataPath}
                        intl={intl}
                    />
                ) : (
                    <div></div>
                )}
            </Hidden>
        </>
    );
}

export default withI18N(injectIntl(DataNavigation), intlData);
