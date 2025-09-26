"use client";

import React, { useEffect, useMemo, useState } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  Button,
  Stack,
  CircularProgress,
  Autocomplete,
  Chip,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Search as SearchIcon,
  People as PeopleIcon,
  Refresh as RefreshIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import Collapse from "@mui/material/Collapse";
import { useDebounce } from "@/hooks/useDebounce";

// We'll render the hierarchy using MUI TreeView/TreeItem for a classic tree look

export default function TeamsPage() {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [employees, setEmployees] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);

  useEffect(() => {
    // fetch logged in user to set sensible default, and fetch employee list for selector
    (async () => {
      try {
        const [meRes, empRes] = await Promise.all([
          axios.get("/api/v0/employee/loggedInUserProfile", {
            withCredentials: true,
          }),
          axios.get("/api/v0/employee/getAllEmployeeList?limit=1000&page=1", {
            withCredentials: true,
          }),
        ]);
        const me = meRes.data?.data || null;
        const list = empRes.data?.data || [];
        setEmployees(list);
        // If user is manager, default to their id, otherwise choose first employee
        if (me && me._id) setSelectedManager(me._id);
        else if (list.length) setSelectedManager(list[0]._id);
      } catch (err) {
        // ignore silently; user may not be authenticated in dev environment
        console.warn(
          "Could not fetch employees or profile",
          err?.message || err
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedManager) return;
    fetchHierarchy(selectedManager);
  }, [selectedManager]);

  async function fetchHierarchy(managerId) {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `/api/v0/employee/hierarchy?managerId=${managerId}`,
        { withCredentials: true }
      );
      setHierarchy(res.data?.data || null);
      // expand root by default
      setExpanded(new Set([res.data?.data?._id]));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load hierarchy"
      );
      setHierarchy(null);
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!hierarchy || !debouncedSearch) return hierarchy;

    const q = debouncedSearch.toLowerCase();

    // Return tree that includes nodes matching query and their ancestors
    function filterNode(node) {
      const match =
        (node.name || "").toLowerCase().includes(q) ||
        (node.designation || "").toLowerCase().includes(q);
      const children = (node.children || []).map(filterNode).filter(Boolean);
      if (match || children.length) {
        return { ...node, children };
      }
      return null;
    }

    return filterNode(hierarchy);
  }, [hierarchy, debouncedSearch]);

  // recursive renderer for a nested Collapse-based tree
  function renderTreeNode(node, path) {
    if (!node) return null;
    const hasChildren = (node.children || []).length > 0;
    const isOpen = expanded.has(node._id);

    const nodePath =
      path || node._id || node.name || Math.random().toString(36).slice(2);

    return (
      <Box sx={{ mb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1,
            borderRadius: 1,
            "&:hover": { bgcolor: "#fafafa" },
          }}
        >
          {hasChildren ? (
            <IconButton size="small" onClick={() => toggle(node._id)}>
              {isOpen ? <ExpandLess /> : <ChevronRightIcon />}
            </IconButton>
          ) : (
            <Box sx={{ width: 40 }} />
          )}

          <Avatar sx={{ bgcolor: "#3f51b5", width: 32, height: 32 }}>
            {node.name ? node.name.charAt(0) : "T"}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700 }}>{node.name}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {node.designation || "-"} • {node.branch || "-"}
            </Typography>
          </Box>
        </Box>

        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 4, mt: 1 }}>
              {(node.children || []).map((c, idx) => {
                const childKey = c._id || `${c.name || "node"}-${idx}`;
                const childPath = `${nodePath}-${childKey}`;
                return (
                  <Box key={childPath}>{renderTreeNode(c, childPath)}</Box>
                );
              })}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  return (
    <PermissionGuard module="team" action="read" fallback={<Unauthorized />}>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
          elevation={3}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <PeopleIcon sx={{ color: "#3f51b5", fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Team Hierarchy
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Visualize reporting lines and explore team members.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: { xs: 2, md: 0 } }}
          >
            <Autocomplete
              options={employees}
              getOptionLabel={(opt) => opt.name || opt.employeeProfileId || ""}
              sx={{ width: 280 }}
              value={employees.find((e) => e._id === selectedManager) || null}
              onChange={(e, val) => setSelectedManager(val?._id || null)}
              renderOption={(props, option) => {
                const key =
                  option._id ||
                  option.employeeProfileId ||
                  `${option.name || "opt"}-${Math.random()
                    .toString(36)
                    .slice(2)}`;
                return (
                  <Box component="li" {...props} key={key}>
                    {option.name || option.employeeProfileId || key}
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Select Manager" />
              )}
              isOptionEqualToValue={(a, b) => a._id === b._id}
            />

            <TextField
              size="small"
              placeholder="Search team member or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                ),
              }}
            />

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => selectedManager && fetchHierarchy(selectedManager)}
            >
              Refresh
            </Button>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2, minHeight: 320 }} elevation={1}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 4 }}>
              <Typography color="error" sx={{ fontWeight: 700 }}>
                {error}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                Try selecting a different manager or refreshing the page.
              </Typography>
            </Box>
          ) : !filtered ? (
            <Box sx={{ p: 4 }}>
              <Typography variant="h6">No team found</Typography>
              <Typography sx={{ color: "text.secondary" }}>
                Try selecting a manager from the dropdown.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label={`Root: ${filtered.name}`} color="primary" />
                <Chip
                  label={`${(filtered.children || []).length} direct reports`}
                />
              </Box>

              <Box sx={{ mt: 1 }}>
                <Box sx={{ mb: 1, display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      // expand all
                      const ids = new Set<string>();
                      function collect(n) {
                        ids.add(n._id);
                        (n.children || []).forEach(collect);
                      }
                      collect(filtered);
                      setExpanded(ids);
                    }}
                  >
                    Expand all
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setExpanded(new Set())}
                  >
                    Collapse all
                  </Button>
                </Box>

                <Box>{renderTreeNode(filtered)}</Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </PermissionGuard>
  );
}

function Unauthorized() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6">Access denied</Typography>
      <Typography variant="body2">
        You don't have permission to view Teams.
      </Typography>
    </Box>
  );
}
