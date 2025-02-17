from sqlalchemy import Integer, String, Numeric, BigInteger, Boolean, Date, JSON, Time, VARCHAR, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, relationship
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()


class SenequeAesnHydro:
    _class_cache = {}

    @staticmethod
    def create(program: str):
        """
        Crée une classe SenequeAesnHydro dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in SenequeAesnHydro._class_cache:
            return SenequeAesnHydro._class_cache[program]

        class DynamicSenequeAesnHydro(Base):
            __tablename__ = "seneque_aesn_hydro"
            __table_args__ = {"schema": program}

            id_hyd: Mapped[int] = mapped_column(Integer, primary_key=True)
            seaoutlet_id: Mapped[int] = mapped_column(Integer)
            libriv: Mapped[str] = mapped_column(String(127))
            fnode: Mapped[float] = mapped_column(Numeric)
            tnode: Mapped[float] = mapped_column(Numeric)
            strahler: Mapped[float] = mapped_column(Numeric)
            verdin: Mapped[float] = mapped_column(Numeric)
            verdinmax: Mapped[int] = mapped_column(BigInteger)
            level: Mapped[float] = mapped_column(Numeric)
            length_m: Mapped[float] = mapped_column(Numeric)
            lengthb_km: Mapped[float] = mapped_column(Numeric)
            lengthd_km: Mapped[float] = mapped_column(Numeric)
            slope_p: Mapped[float] = mapped_column(Numeric)
            width_m: Mapped[float] = mapped_column(Numeric)
            depth_m: Mapped[float] = mapped_column(Numeric)
            sbv_km2: Mapped[float] = mapped_column(Numeric)
            geom: Mapped[Geometry] = mapped_column(Geometry("MULTILINESTRING", srid=3035))
            geojson_feature: Mapped[dict] = mapped_column(JSONB)
            

        SenequeAesnHydro._class_cache[program] = DynamicSenequeAesnHydro
        return DynamicSenequeAesnHydro


class SenequeAesnBasin:
    _class_cache = {}

    @staticmethod
    def create(program: str):
        """
        Crée une classe SenequeAesnBasin dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in SenequeAesnBasin._class_cache:
            return SenequeAesnBasin._class_cache[program]

        class DynamicSenequeAesnBasin(Base):
            __tablename__ = "seneque_aesn_hydro_basin"
            __table_args__ = {"schema": program}

            id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
            area_km2: Mapped[float] = mapped_column(Numeric)
            geom: Mapped[Geometry] = mapped_column(Geometry("POLYGON"))

        SenequeAesnBasin._class_cache[program] = DynamicSenequeAesnBasin
        return DynamicSenequeAesnBasin


class Pk:
    _class_cache = {}

    @staticmethod
    def create(program: str):
        """
        Crée une classe Pk dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in Pk._class_cache:
            return Pk._class_cache[program]

        class DynamicPk(Base):
            __tablename__ = "pk_map"
            __table_args__ = {"schema": program}

            code_bas: Mapped[str] = mapped_column(String, nullable=True)
            id_obj: Mapped[int] = mapped_column(Integer, primary_key=True)
            strahler: Mapped[int] = mapped_column(Integer, primary_key=True)
            pk: Mapped[int] = mapped_column(Integer, primary_key=True)
            obj_ord_pk: Mapped[str] = mapped_column(String, nullable=True)
            catchment_id: Mapped[int] = mapped_column(Integer, primary_key=True)
            the_geom: Mapped[Geometry] = mapped_column(Geometry("LINESTRING", srid=3035), nullable=True)
            geojson_feature: Mapped[dict] = mapped_column(JSONB)
            
        Pk._class_cache[program] = DynamicPk
        return DynamicPk


class Scenario(Base):
    __tablename__ = "scenario"
    __table_args__ = {"schema": "zone_aesn_seneque_aesn_me_edl2025_qgis"}

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    codescn: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    obs_year: Mapped[int] = mapped_column(Integer)


class StationSnap(Base):
    __tablename__ = "station_snap"
    __table_args__ = {"schema": "aesn_network"}

    station_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(30), nullable=True)
    cntry_iso: Mapped[str] = mapped_column(String(2), nullable=True)
    upstream_km2: Mapped[float] = mapped_column(Numeric(11, 4), nullable=True)
    geom3035: Mapped[Geometry] = mapped_column(Geometry("POINT", srid=3035), nullable=True)


class PkStation:
    _class_cache = {}

    @staticmethod
    def create(program: str):
        """
        Crée une classe PkStation dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in PkStation._class_cache:
            return PkStation._class_cache[program]

        class DynamicPkStation(Base):
            __tablename__ = "pk_station"
            __table_args__ = {"schema": program}

            id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
            station_id: Mapped[int] = mapped_column(Integer, nullable=True)
            code_stat: Mapped[str] = mapped_column(String(30), nullable=True)
            id_objects: Mapped[int] = mapped_column(Integer, nullable=True)
            strahler: Mapped[int] = mapped_column(Integer, nullable=True)
            pk: Mapped[int] = mapped_column(Integer, nullable=True)
            snap_dist_m: Mapped[float] = mapped_column(Numeric(11, 4), nullable=True)

        PkStation._class_cache[program] = DynamicPkStation
        return DynamicPkStation


class Measurement:
    _class_cache = {}

    @staticmethod
    def create(measurement_type: str):
        """
        Crée une classe Measurement dynamique pour accéder aux tables measurement_chemical, 
        measurement_biological ou measurement_physical dans le schéma 'data'.

        Args:
            measurement_type (str): Nom de la table (measurement_chemical, measurement_biological, measurement_physical).

        Returns:
            type: Classe dynamique.
        """
        if measurement_type in Measurement._class_cache:
            return Measurement._class_cache[measurement_type]

        class DynamicMeasurement(Base):
            __tablename__ = measurement_type
            __table_args__ = {"schema": "data"}

            id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
            co_varfracom_id: Mapped[int] = mapped_column(Integer)
            station_id: Mapped[int] = mapped_column(Integer)
            distribution_id: Mapped[int] = mapped_column(Integer)
            value: Mapped[float] = mapped_column(Numeric)
            timestep: Mapped[str] = mapped_column(String(1))
            validity: Mapped[str] = mapped_column(VARCHAR)
            meas_depth: Mapped[float] = mapped_column(Numeric(11, 4))
            meas_date: Mapped[Date] = mapped_column(Date)
            meas_time: Mapped[Time] = mapped_column(Time)
            update_date: Mapped[Date] = mapped_column(Date)
            update_remark: Mapped[str] = mapped_column(VARCHAR)
            flag: Mapped[str] = mapped_column(VARCHAR(20))

        Measurement._class_cache[measurement_type] = DynamicMeasurement
        return DynamicMeasurement

class Varcompartment:
    _class_cache = {}
    
    @staticmethod
    def create(program: str):
        """
        Crée une classe Varcompartment dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in Varcompartment._class_cache:
            return Varcompartment._class_cache[program]

        class DynamicVarcompartment(Base):
            __tablename__ = "varcompartment"
            __table_args__ = {"schema": program}

            id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
            id_defvariable: Mapped[int] = mapped_column(Integer, ForeignKey(f"{program}.def_variable.id"))
            id_compartment: Mapped[int] = mapped_column(Integer)
            unit_short: Mapped[str] = mapped_column(String)
            unit_long: Mapped[str] = mapped_column(String)

            defvariable = relationship("DefVariable", back_populates="varcompartments")

        Varcompartment._class_cache[program] = DynamicVarcompartment
        return Varcompartment

class DefVariable:
    _class_cache = {}
    
    @staticmethod
    def create(program: str):
        """
        Crée une classe DefVariable dynamique pour un programme donné.

        Args:
            program (str): Nom du programme (schéma).

        Returns:
            type: Classe dynamique.
        """
        if program in DefVariable._class_cache:
            return DefVariable._class_cache[program]

        class DynamicDefVariable(Base):
            __tablename__ = "defvariable"
            __table_args__ = {"schema": program}

            id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
            code: Mapped[str] = mapped_column(String)
            name: Mapped[str] = mapped_column(String)

            varcompartments = relationship("Varcompartment", back_populates="defvariable")

        DefVariable._class_cache[program] = DynamicDefVariable
        return DynamicDefVariable