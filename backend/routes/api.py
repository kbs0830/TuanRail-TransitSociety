from flask import Blueprint, jsonify, request

from ..content import AXES, EVENTS, MEMBERS, SITE_INFO, get_episode, get_episode_index
from ..stations import load_station_data

api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/episodes", methods=["GET"])
def api_episodes():
    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episodes": get_episode_index(),
            },
        }
    )


@api_bp.route("/episodes/<slug>", methods=["GET"])
def api_episode_detail(slug):
    episode = get_episode(slug)
    if not episode:
        return jsonify({"ok": False, "message": "找不到指定章節"}), 404

    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episode": episode,
            },
        }
    )


@api_bp.route("/ep1", methods=["GET"])
def api_ep1_legacy():
    return jsonify(
        {
            "ok": True,
            "data": {
                "site": SITE_INFO,
                "axes": AXES,
                "episode": get_episode("ep1"),
            },
        }
    )


@api_bp.route("/members", methods=["GET"])
def api_members():
    return jsonify(
        {
            "ok": True,
            "data": {
                "axes": AXES,
                "members": MEMBERS,
            },
        }
    )


@api_bp.route("/events", methods=["GET"])
def api_events():
    return jsonify(
        {
            "ok": True,
            "data": {
                "axes": AXES,
                "events": EVENTS,
            },
        }
    )


@api_bp.route("/stations", methods=["GET"])
def api_stations():
    limit = request.args.get("limit", type=int)
    stations = load_station_data(limit=limit)
    return jsonify(
        {
            "ok": True,
            "data": {
                "stations": stations,
            },
        }
    )
